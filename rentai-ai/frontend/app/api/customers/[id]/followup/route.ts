import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend";

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  return proxyToBackend(`/api/customers/${id}/followup`, { method: "POST" });
}
