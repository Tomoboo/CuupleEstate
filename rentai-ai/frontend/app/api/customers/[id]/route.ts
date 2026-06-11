import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  return proxyToBackend(`/api/customers/${id}`);
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = await req.text();
  return proxyToBackend(`/api/customers/${id}`, { method: "PATCH", body });
}
