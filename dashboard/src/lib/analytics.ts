// The analytics endpoint returns numbers as strings and may leave fields out.
// Normalise once so the page never shows "undefined" or crashes on a bad body.

type Raw = Record<string, unknown>;

const num = (v: unknown): number => {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
};
const optNum = (v: unknown): number | undefined =>
  v === null || v === undefined || v === "" || !Number.isFinite(Number(v))
    ? undefined
    : Number(v);
const text = (v: unknown): string => (typeof v === "string" ? v : "");
const rows = (v: unknown): Raw[] =>
  Array.isArray(v)
    ? v.filter((r): r is Raw => typeof r === "object" && r !== null)
    : [];
const obj = (v: unknown): Raw =>
  typeof v === "object" && v !== null ? (v as Raw) : {};

export interface AnalyticsData {
  kpis: {
    totalRevenue: number;
    totalBookings: number;
    cancellationRate: number;
    avgGroupSize: number;
  };
  revenueGrowth?: number;
  bookingsGrowth?: number;
  revenueOverTime: { month: string; revenue: number; bookings: number }[];
  bookingsByTour: { name: string; bookings: number; revenue: number }[];
  bookingsBySource: { name: string; value: number }[];
  popularTimeSlots: { slot: string; bookings: number }[];
  revenuePerGuide: {
    guideName: string;
    position: string;
    toursLed: number;
    revenue: number;
  }[];
}

export function normalizeAnalytics(raw: unknown): AnalyticsData {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Analytics response was not an object");
  }
  const d = raw as Raw;
  const kpis = obj(d.kpis);
  const growth = obj(d.mom_growth);
  return {
    kpis: {
      totalRevenue: num(kpis.total_revenue),
      totalBookings: num(kpis.total_bookings),
      cancellationRate: num(kpis.cancellation_rate),
      avgGroupSize: num(kpis.avg_group_size),
    },
    revenueGrowth: optNum(growth.revenue_growth),
    bookingsGrowth: optNum(growth.bookings_growth),
    revenueOverTime: rows(d.revenue_over_time).map((r) => ({
      month: text(r.month),
      revenue: num(r.revenue),
      bookings: num(r.bookings),
    })),
    bookingsByTour: rows(d.bookings_by_tour).map((t) => {
      const name = text(t.tour_name);
      return {
        name: name.length > 25 ? `${name.slice(0, 25)}…` : name,
        bookings: num(t.bookings),
        revenue: num(t.revenue),
      };
    }),
    bookingsBySource: rows(d.bookings_by_source).map((s) => ({
      name: text(s.source).replace("_", " "),
      value: num(s.count),
    })),
    popularTimeSlots: rows(d.popular_time_slots).map((s) => {
      const slot = text(s.slot);
      return { slot: `${slot.slice(0, 5)}–${slot.slice(9, 14)}`, bookings: num(s.bookings) };
    }),
    revenuePerGuide: rows(d.revenue_per_guide).map((g) => ({
      guideName: text(g.guide_name),
      position: text(g.position),
      toursLed: num(g.tours_led),
      revenue: num(g.revenue),
    })),
  };
}
