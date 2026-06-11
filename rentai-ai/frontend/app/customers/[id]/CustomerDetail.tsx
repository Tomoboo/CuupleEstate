"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ConversationLog from "@/components/ConversationLog";
import ScoreBadge from "@/components/ScoreBadge";
import {
  fetchCustomer,
  generateFollowup,
  updateCustomer,
} from "@/lib/api";
import {
  STATUS_LABELS,
  STATUSES,
  type ConversationMessage,
  type Customer,
} from "@/lib/types";

const SCORE_ITEMS: { key: keyof Customer; label: string }[] = [
  { key: "score_urgency", label: "今すぐ度" },
  { key: "score_budget", label: "予算現実性" },
  { key: "score_initial_cost", label: "初期費用余力" },
  { key: "score_credit_risk", label: "審査リスク" },
  { key: "score_condition_overload", label: "条件過多度" },
];

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="text-sm text-slate-800">{value ?? "未回答"}</dd>
    </div>
  );
}

export default function CustomerDetail({ id }: { id: string }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [conversations, setConversations] = useState<ConversationMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [template, setTemplate] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchCustomer(id);
      setCustomer(data.customer);
      setConversations(data.conversations);
      setNotes(data.customer.notes ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (status: string) => {
    if (!customer) return;
    setCustomer({ ...customer, status: status as Customer["status"] });
    try {
      await updateCustomer(id, { status });
    } catch {
      load();
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await updateCustomer(id, { notes });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setTemplate(null);
    try {
      const data = await generateFollowup(id);
      setTemplate(data.template);
    } catch (e) {
      setError(e instanceof Error ? e.message : "テンプレ生成に失敗しました");
    } finally {
      setGenerating(false);
    }
  };

  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!customer) return <p className="text-sm text-slate-400">読み込み中…</p>;

  return (
    <div>
      <Link href="/" className="text-sm text-slate-500 hover:underline">
        ← 顧客一覧へ戻る
      </Link>

      <div className="mt-3 flex items-center gap-3">
        <ScoreBadge rank={customer.score_rank} />
        <h1 className="text-xl font-bold text-slate-800">
          {customer.display_name ?? "（名前未取得）"}
        </h1>
        <select
          className="ml-auto rounded border border-slate-300 bg-white px-2 py-1.5 text-sm"
          value={customer.status}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          {/* ヒアリング結果サマリ */}
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 font-semibold text-slate-700">ヒアリング結果</h2>
            <dl className="grid grid-cols-2 gap-3">
              <Field label="引越し時期" value={customer.move_date} />
              <Field label="希望エリア" value={customer.desired_area} />
              <Field
                label="家賃上限"
                value={customer.rent_max != null ? `${customer.rent_max}万円` : null}
              />
              <Field
                label="初期費用上限"
                value={
                  customer.initial_cost_max != null
                    ? `${customer.initial_cost_max}万円`
                    : null
                }
              />
              <Field label="間取り" value={customer.floor_plan} />
              <Field
                label="同居人数"
                value={customer.num_people != null ? `${customer.num_people}人` : null}
              />
              <Field label="職業" value={customer.occupation} />
              <Field
                label="年収"
                value={
                  customer.income_annual != null
                    ? `${customer.income_annual}万円`
                    : null
                }
              />
              <Field
                label="保証人"
                value={
                  customer.has_guarantor == null
                    ? null
                    : customer.has_guarantor
                      ? "あり"
                      : "なし"
                }
              />
              <Field label="審査不安" value={customer.credit_concern} />
              <Field
                label="絶対条件"
                value={customer.must_conditions?.join("・") || null}
              />
              <Field
                label="妥協できる条件"
                value={customer.flexible_conditions?.join("・") || null}
              />
            </dl>
          </section>

          {/* AIスコア詳細 */}
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 font-semibold text-slate-700">AIスコア詳細</h2>
            {customer.score_rank ? (
              <>
                <div className="grid grid-cols-5 gap-2">
                  {SCORE_ITEMS.map(({ key, label }) => (
                    <div key={key} className="rounded bg-slate-50 p-2 text-center">
                      <p className="text-[11px] text-slate-400">{label}</p>
                      <p className="text-lg font-bold text-slate-800">
                        {(customer[key] as number | null) ?? "—"}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm whitespace-pre-wrap text-slate-600">
                  {customer.score_reason}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-400">
                ヒアリング完了後にスコアリングされます。
              </p>
            )}
          </section>

          {/* 追客テンプレ生成 */}
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 font-semibold text-slate-700">追客テンプレ生成</h2>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {generating
                ? "生成中…"
                : `「${STATUS_LABELS[customer.status]}」向けテンプレを生成`}
            </button>
            {template && (
              <div className="mt-3">
                <textarea
                  readOnly
                  value={template}
                  rows={8}
                  className="w-full rounded border border-slate-300 p-2 text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(template)}
                  className="mt-1 text-xs text-emerald-700 hover:underline"
                >
                  コピーする
                </button>
              </div>
            )}
          </section>

          {/* メモ */}
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 font-semibold text-slate-700">メモ</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded border border-slate-300 p-2 text-sm"
              placeholder="営業メモを入力…"
            />
            <button
              onClick={handleSaveNotes}
              disabled={saving}
              className="mt-2 rounded bg-slate-700 px-4 py-1.5 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "保存中…" : "メモを保存"}
            </button>
          </section>
        </div>

        {/* 会話ログ */}
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 font-semibold text-slate-700">LINE会話ログ</h2>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <ConversationLog messages={conversations} />
          </div>
        </section>
      </div>
    </div>
  );
}
