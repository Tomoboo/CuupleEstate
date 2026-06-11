import type { Rank } from "@/lib/types";

const RANK_STYLES: Record<Rank, string> = {
  S: "bg-red-600 text-white",
  A: "bg-orange-500 text-white",
  B: "bg-yellow-400 text-slate-900",
  C: "bg-sky-400 text-white",
  D: "bg-slate-300 text-slate-700",
};

export default function ScoreBadge({ rank }: { rank: Rank | null }) {
  if (!rank) {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-400">
        —
      </span>
    );
  }
  return (
    <span
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${RANK_STYLES[rank]}`}
    >
      {rank}
    </span>
  );
}
