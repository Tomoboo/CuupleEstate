import type { ConversationMessage } from "@/lib/types";

function fmt(ts: string | null): string {
  if (!ts) return "";
  return new Date(ts).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ConversationLog({
  messages,
}: {
  messages: ConversationMessage[];
}) {
  if (messages.length === 0) {
    return <p className="text-sm text-slate-400">会話履歴はまだありません。</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {messages.map((m, i) => (
        <div
          key={m.id ?? i}
          className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}
        >
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
              m.role === "user"
                ? "rounded-tl-sm bg-slate-200 text-slate-800"
                : "rounded-tr-sm bg-emerald-500 text-white"
            }`}
          >
            <p>{m.content}</p>
            <p
              className={`mt-1 text-right text-[10px] ${
                m.role === "user" ? "text-slate-500" : "text-emerald-100"
              }`}
            >
              {m.role === "user" ? "顧客" : "AI"} {fmt(m.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
