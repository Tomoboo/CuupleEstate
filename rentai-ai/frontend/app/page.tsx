"use client";

import { useCallback, useEffect, useState } from "react";
import CustomerCard from "@/components/CustomerCard";
import { fetchCustomers, updateCustomer } from "@/lib/api";
import type { Customer } from "@/lib/types";

const TABS = ["ALL", "S", "A", "B", "C", "D"] as const;
type Tab = (typeof TABS)[number];

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("ALL");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (rank: Tab) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCustomers(rank);
      setCustomers(data.customers);
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  const handleStatusChange = async (id: string, status: string) => {
    // 楽観的更新
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: status as Customer["status"] } : c)),
    );
    try {
      await updateCustomer(id, { status });
    } catch {
      load(tab); // 失敗時は再取得して巻き戻す
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-800">顧客一覧</h1>

      <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              tab === t
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "ALL" ? "全て" : `${t}ランク`}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-slate-400">読み込み中…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && customers.length === 0 && (
        <p className="text-sm text-slate-400">該当する顧客がいません。</p>
      )}

      <div className="flex flex-col gap-3">
        {customers.map((c) => (
          <CustomerCard key={c.id} customer={c} onStatusChange={handleStatusChange} />
        ))}
      </div>
    </div>
  );
}
