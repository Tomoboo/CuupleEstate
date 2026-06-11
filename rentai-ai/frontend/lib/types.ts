export type Rank = "S" | "A" | "B" | "C" | "D";

export const STATUSES = [
  "hearing",
  "condition_review",
  "proposable",
  "pre_visit",
  "post_visit",
  "pre_apply",
  "applied",
  "screening",
  "pre_contract",
  "contracted",
] as const;

export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  hearing: "ヒアリング中",
  condition_review: "条件確認",
  proposable: "提案可能",
  pre_visit: "内見前",
  post_visit: "内見後",
  pre_apply: "申込前",
  applied: "申込済",
  screening: "審査中",
  pre_contract: "契約前",
  contracted: "成約",
};

export interface Customer {
  id: string;
  line_user_id: string;
  display_name: string | null;
  created_at: string | null;

  move_date: string | null;
  desired_area: string | null;
  rent_max: number | null;
  initial_cost_max: number | null;
  floor_plan: string | null;
  num_people: number | null;
  occupation: string | null;
  income_annual: number | null;
  has_guarantor: boolean | null;
  credit_concern: string | null;
  must_conditions: string[] | null;
  flexible_conditions: string[] | null;

  score_rank: Rank | null;
  score_urgency: number | null;
  score_budget: number | null;
  score_initial_cost: number | null;
  score_credit_risk: number | null;
  score_condition_overload: number | null;
  score_reason: string | null;

  status: Status;
  hearing_completed: boolean;
  last_contacted_at: string | null;
  sales_notified_at: string | null;
  notes: string | null;
}

export interface ConversationMessage {
  id: string | null;
  customer_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string | null;
}
