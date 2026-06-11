import type { Customer, ConversationMessage } from "./types";

// クライアントからは Next.js の Route Handler（/api/*）を経由してバックエンドへ
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json();
}

export function fetchCustomers(rank?: string): Promise<{ customers: Customer[] }> {
  const q = rank && rank !== "ALL" ? `?rank=${encodeURIComponent(rank)}` : "";
  return request(`/api/customers${q}`);
}

export function fetchCustomer(
  id: string,
): Promise<{ customer: Customer; conversations: ConversationMessage[] }> {
  return request(`/api/customers/${id}`);
}

export function updateCustomer(
  id: string,
  fields: { status?: string; notes?: string },
): Promise<{ customer: Customer }> {
  return request(`/api/customers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(fields),
  });
}

export function generateFollowup(id: string): Promise<{ template: string }> {
  return request(`/api/customers/${id}/followup`, { method: "POST" });
}
