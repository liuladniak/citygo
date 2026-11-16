// One source of truth for booking status colours. The tone tokens (success,
// warning, info, danger) live in App.css; every status badge, calendar event,
// legend dot and card accent reads from here so they cannot drift apart.

export type StatusTone = "success" | "warning" | "info" | "danger" | "neutral";

export const BOOKING_STATUS: Record<
  string,
  { label: string; tone: StatusTone }
> = {
  confirmed: { label: "Confirmed", tone: "success" },
  pending: { label: "Pending", tone: "warning" },
  completed: { label: "Completed", tone: "info" },
  cancelled: { label: "Cancelled", tone: "danger" },
  draft: { label: "Draft", tone: "neutral" },
};

export const bookingStatus = (status?: string | null) =>
  BOOKING_STATUS[status?.toLowerCase() ?? ""] ?? BOOKING_STATUS.draft;

// Full class names are written out so Tailwind can see them.
export const TONE_BADGE: Record<StatusTone, string> = {
  success: "bg-success/10 text-success-foreground ring-success/25",
  warning: "bg-warning/10 text-warning-foreground ring-warning/30",
  info: "bg-info/10 text-info-foreground ring-info/25",
  danger: "bg-danger/10 text-danger-foreground ring-danger/25",
  neutral: "bg-muted text-muted-foreground ring-border",
};

export const TONE_DOT: Record<StatusTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  danger: "bg-danger",
  neutral: "bg-muted-foreground/50",
};

export const TONE_ACCENT_BORDER: Record<StatusTone, string> = {
  success: "border-l-success",
  warning: "border-l-warning",
  info: "border-l-info",
  danger: "border-l-danger",
  neutral: "border-l-border",
};

/** CSS colour for places that cannot use classes (FullCalendar events). */
export const TONE_COLOR: Record<StatusTone, string> = {
  success: "var(--success)",
  warning: "var(--warning)",
  info: "var(--info)",
  danger: "var(--danger)",
  neutral: "var(--muted-foreground)",
};
