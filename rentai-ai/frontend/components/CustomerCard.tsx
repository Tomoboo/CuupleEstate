"use client";

import Link from "next/link";
import ScoreBadge from "./ScoreBadge";
import { STATUS_LABELS, STATUSES, type Customer } from "@/lib/types";

function isNew(customer: Customer): boolean {
  if (!customer.created_at) return false;
  return Date.now() - new Date(customer.created_at).getTime() < 24 * 60 * 60 * 1000;
}

export default function CustomerCard({
  customer,
  onStatusChange,
}: {
  customer: Customer;
  onStatusChange: (id: string, status: string) => void;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm ${
        isNew(customer) ? "border-emerald-400 ring-1 ring-emerald-200" : "border-slate-200"
      }`}
    >
      <ScoreBadge rank={customer.score_rank} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/customers/${customer.id}`}
            className="truncate font-semibold text-slate-800 hover:underline"
          >
            {customer.display_name ?? "（名前未取得）"}
          </Link>
          {isNew(customer) && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
              NEW
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
          <span>📅 {customer.move_date ?? "未回答"}</span>
          <span>💰 {customer.rent_max != null ? `${customer.rent_max}万円以内` : "未回答"}</span>
          <span>📍 {customer.desired_area ?? "未回答"}</span>
        </div>
      </div>
      <select
        className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm"
        value={customer.status}
        onChange={(e) => onStatusChange(customer.id, e.target.value)}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  );
}
