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
