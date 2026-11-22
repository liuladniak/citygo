// Tours run on Istanbul time but the server runs in UTC, so "today" and "now" for anything
// that compares with a tour's date or start time must be read in the company's timezone.

export const DEFAULT_TIMEZONE = "Europe/Istanbul";

export type ZonedNow = { date: string; time: string };

/** The date (YYYY-MM-DD) and time (HH:MM:SS) it is right now in the given timezone. */
export function nowInZone(timeZone: string = DEFAULT_TIMEZONE, at: Date = new Date()): ZonedNow {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(at);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}:${get("second")}`,
  };
}
