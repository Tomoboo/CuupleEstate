-- 賃貸SNS反響AI成約支援システム スキーマ
-- Supabase (PostgreSQL) の SQL Editor で実行してください

-- 顧客テーブル
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- ヒアリング結果
  move_date TEXT,           -- 引越し時期（例: "1ヶ月以内", "3ヶ月以内"）
  desired_area TEXT,        -- 希望エリア
  rent_max INTEGER,         -- 家賃上限（万円）
  initial_cost_max INTEGER, -- 初期費用上限（万円）
  floor_plan TEXT,          -- 間取り希望
  num_people INTEGER,       -- 同居人数
  occupation TEXT,          -- 職業（会社員/学生/自営業 等）
  income_annual INTEGER,    -- 年収（万円）
  has_guarantor BOOLEAN,    -- 保証人の有無
  credit_concern TEXT,      -- 審査不安の内容
  must_conditions TEXT[],   -- 絶対条件（配列）
  flexible_conditions TEXT[], -- 妥協できる条件（配列）

  -- スコアリング結果
  score_rank TEXT,          -- S / A / B / C / D
  score_urgency INTEGER,    -- 今すぐ度 1-5
  score_budget INTEGER,     -- 予算現実性 1-5
  score_initial_cost INTEGER, -- 初期費用余力 1-5
  score_credit_risk INTEGER,  -- 審査リスク 1-5（低いほどリスク高）
  score_condition_overload INTEGER, -- 条件過多度 1-5（低いほど過多）
  score_reason TEXT,        -- スコア判定理由（AI生成）

  -- 顧客状態管理
  status TEXT DEFAULT 'hearing',
  -- hearing / condition_review / proposable / pre_visit /
  -- post_visit / pre_apply / applied / screening / pre_contract / contracted

  hearing_completed BOOLEAN DEFAULT FALSE,
  last_contacted_at TIMESTAMPTZ,
  sales_notified_at TIMESTAMPTZ,
  notes TEXT
);

-- 会話履歴テーブル
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  role TEXT NOT NULL,   -- 'user' または 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_customer_id ON conversations (customer_id, created_at);
CREATE INDEX idx_customers_score_rank ON customers (score_rank);
CREATE INDEX idx_customers_status ON customers (status);
