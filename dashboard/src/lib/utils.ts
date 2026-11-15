import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTime = (t: string | null | undefined) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  if (isNaN(h)) return "—";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${
    h >= 12 ? "PM" : "AM"
  }`;
};

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

/**
 * Returns a copy of `value` with every string escaped for safe use inside
 * HTML. Use it on customer-supplied data before building a document that is
 * written with `document.write` (voucher, invoice, printed schedule).
 */
export function escapeDeep<T>(value: T): T {
  if (typeof value === "string") return escapeHtml(value) as T;
  if (Array.isArray(value)) return value.map(escapeDeep) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, escapeDeep(v)])
    ) as T;
  }
  return value;
}
