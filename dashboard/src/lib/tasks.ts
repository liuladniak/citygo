export type TaskStatus =
  | "open"
  | "in_progress"
  | "done"
  | "dismissed"
  | "cancelled";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  type: string;
  booking_id: number | null;
  assigned_to: number | null;
  created_by: number | null;
  priority: "urgent" | "normal" | "low";
  status: TaskStatus;
  due_date: string | null;
  is_auto_generated: boolean;
  assignee_name: string | null;
  creator_name: string | null;
  booking_reference: string | null;
  completed_at: string | null;
  completed_by: number | null;
}

export const cleanTaskTitle = (title: string) =>
  title.replace(/^\[auto_\w+\]\s*/, "");

export const autoTaskKind = (title: string) =>
  title.match(/^\[(auto_\w+)\]/)?.[1] ?? null;

export const isTaskSelectable = (t: Pick<Task, "status">) =>
  t.status === "open" || t.status === "in_progress";

export const DISMISS_REASONS = [
  "Handled outside the system",
  "Guest pays on the day",
  "Partner agency handles it",
  "Booking changed",
];

type TaskNote = { id: number; title: string; reason: string };
export type ClosePlan = {
  ready: number[];
  unresolved: TaskNote[];
  skipped: TaskNote[];
};
export type CloseResult = {
  updated: number[];
  unresolved: TaskNote[];
  skipped: TaskNote[];
};
