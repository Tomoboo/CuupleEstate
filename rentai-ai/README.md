# RentAI — 賃貸SNS反響AI成約支援システム（MVP）

賃貸仲介のSNS反響（Instagram → LINE）に対して、AIが自動ヒアリング・スコアリング・
顧客教育・営業通知を行うシステムです。

## 構成

| レイヤー | 技術 |
|---|---|
| バックエンド | FastAPI (Python 3.11+) |
| AI | Anthropic Claude API |
| LINE連携 | LINE Messaging API (Webhook / Push) |
| DB | Supabase (PostgreSQL) |
| 管理UI | Next.js 16 (App Router) + Tailwind CSS v4 |

> **メモ:** 要件で指定された `claude-sonnet-4-20250514` は 2026-06-15 に廃止されるため、
> 既定モデルは後継の `claude-sonnet-4-6` にしています（`ANTHROPIC_MODEL` で変更可能）。
> また、管理UIはリポジトリ既存の Next.js 16 / Tailwind v4 に合わせています（要件記載は Next.js 14）。

```
rentai-ai/
├── backend/
│   ├── main.py                  # FastAPI エントリポイント
│   ├── config.py                # 環境変数
│   ├── routers/
│   │   ├── webhook.py           # LINE Webhook受信（署名検証）
│   │   └── dashboard.py         # 管理API（一覧/詳細/更新/追客/再スコア/通知バッチ）
│   ├── services/
│   │   ├── line_service.py      # LINE送受信・署名検証
│   │   ├── ai_service.py        # Claude API呼び出し（リトライ付き）
│   │   ├── scoring_service.py   # スコアリング + ランク判定
│   │   └── notify_service.py    # 営業通知（S/A即時・B/Cバッチ）
│   ├── models/
│   │   ├── customer.py          # 顧客モデル + リポジトリ
│   │   └── conversation.py      # 会話履歴モデル + リポジトリ
│   ├── db/
│   │   ├── supabase_client.py
│   │   └── schema.sql           # テーブル定義
│   ├── prompts/                 # ヒアリング/スコアリング/返信/追客プロンプト
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── app/
    │   ├── page.tsx                       # 顧客一覧（ランク別タブ）
    │   ├── customers/[id]/page.tsx        # 顧客詳細・会話ログ・追客テンプレ
    │   └── api/customers/...              # バックエンドへのプロキシ Route Handler
    └── components/                        # CustomerCard / ScoreBadge / ConversationLog
```

## セットアップ

### 1. DB（Supabase）

1. Supabase プロジェクトを作成
2. SQL Editor で `backend/db/schema.sql` を実行
3. `Project Settings → API` から URL と `service_role` キーを控える

### 2. バックエンド（FastAPI）

```bash
cd rentai-ai/backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # 各値を設定
uvicorn main:app --reload --port 8000
```

### 3. LINE 公式アカウント

1. [LINE Developers](https://developers.line.biz/) で Messaging API チャネルを作成
2. チャネルアクセストークン（長期）とチャネルシークレットを `.env` に設定
3. Webhook URL に `https://<バックエンドのURL>/webhook` を設定し、Webhook を有効化
4. 応答メッセージ（自動応答）はオフにする
5. 営業担当が公式アカウントを友だち追加し、その User ID を `LINE_SALES_USER_ID` に設定

ローカル開発では `ngrok http 8000` 等でトンネルして Webhook URL に設定します。

### 4. フロントエンド（Next.js）

```bash
cd rentai-ai/frontend
npm install
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 npm run dev
```

`http://localhost:3000` でダッシュボードが開きます。

## 環境変数

| 変数 | 用途 |
|---|---|
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging API のアクセストークン |
| `LINE_CHANNEL_SECRET` | Webhook 署名検証用シークレット |
| `LINE_SALES_USER_ID` | 営業担当の LINE User ID（通知先） |
| `ANTHROPIC_API_KEY` | Claude API キー |
| `ANTHROPIC_MODEL` | 使用モデル（既定: `claude-sonnet-4-6`） |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase 接続情報 |
| `DASHBOARD_BASE_URL` | 営業通知に埋め込む顧客詳細URLのベース |
| `FRONTEND_ORIGIN` | CORS 許可オリジン |
| `NEXT_PUBLIC_API_BASE_URL` | フロントエンド → バックエンドのURL |

## 処理フロー

```
LINEメッセージ受信（POST /webhook, X-Line-Signature 検証）
  ↓
customers を line_user_id で検索（新規ならレコード作成 + ウェルカム送信）
  ↓
Claude にシステムプロンプト + 会話履歴を渡してヒアリング継続
  （返信文と抽出項目を JSON で受け取り DB 反映）
  ↓
必須7項目が揃ったらヒアリング完了 → スコアリング実行
  ↓
顧客へ条件診断メッセージを自動返信
  ↓
S/Aランクは営業担当のLINEへ即時通知
B/Cランクは POST /api/batch/notify-b（cron想定）で通知
```

## 管理API

| メソッド | パス | 内容 |
|---|---|---|
| GET | `/api/customers?rank=S` | 顧客一覧（ランク/ステータス絞り込み） |
| GET | `/api/customers/{id}` | 顧客詳細 + 会話履歴 |
| PATCH | `/api/customers/{id}` | ステータス・メモ更新 |
| POST | `/api/customers/{id}/followup` | status別 追客テンプレ生成 |
| POST | `/api/customers/{id}/rescore` | スコア再計算（手動トリガー） |
| POST | `/api/batch/notify-b` | B/Cランク未通知顧客への通知バッチ |

## デプロイ（Railway / Render）

- **backend**: `uvicorn main:app --host 0.0.0.0 --port $PORT`（ルートディレクトリ `rentai-ai/backend`）
- **frontend**: `npm run build` → `npm start`（ルートディレクトリ `rentai-ai/frontend`）
- B/Cランク通知は各PaaSの cron 機能で毎朝9時に `POST /api/batch/notify-b` を実行

## MVP完成の定義（チェックリスト）

- [x] LINEで送信すると、AIがヒアリングを開始する
- [x] 必須項目のヒアリングが完了するとスコアリングが実行される
- [x] 顧客に条件診断の返信が自動送信される
- [x] S/Aランクの顧客が来た時に営業担当のLINEに通知が届く
- [x] ダッシュボードで顧客一覧・詳細・会話ログが確認できる
- [x] ステータス変更と追客テンプレ生成ができる
