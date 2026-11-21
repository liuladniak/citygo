import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/apiClient";
import { format, subMonths, subYears, startOfYear } from "date-fns";
import type { LucideIcon } from "lucide-react";
import { normalizeAnalytics } from "@/lib/analytics";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Euro,
  Calendar,
  Users,
  XCircle,
  Award,
} from "lucide-react";



// Chart text and tooltips follow the theme so they stay readable in dark mode.
const AXIS_TICK = { fontSize: 12, fill: "var(--muted-foreground)" };
const TOOLTIP_STYLE = {
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
};

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const DATE_RANGES = [
  { label: "Last 30 days", value: "30d" },
  { label: "Last 3 months", value: "3m" },
  { label: "Last 6 months", value: "6m" },
  { label: "This year", value: "ytd" },
  { label: "Last year", value: "1y" },
  { label: "All time", value: "all" },
];

function getDateRange(range: string) {
  const now = new Date();
  const to = format(now, "yyyy-MM-dd");
  switch (range) {
    case "30d":
      return { from: format(subMonths(now, 1), "yyyy-MM-dd"), to };
    case "3m":
      return { from: format(subMonths(now, 3), "yyyy-MM-dd"), to };
    case "6m":
      return { from: format(subMonths(now, 6), "yyyy-MM-dd"), to };
    case "ytd":
      return { from: format(startOfYear(now), "yyyy-MM-dd"), to };
    case "1y":
      return { from: format(subYears(now, 1), "yyyy-MM-dd"), to };
    default:
      return { from: "2024-01-01", to };
  }
}

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
  trend,
  trendLabel,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconClass?: string;
  trend?: number;
  trendLabel?: string;
}) {
  return (
    <Card>
      <CardContent className="px-4 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className={`p-1.5 rounded-lg bg-muted/50 ${iconClass}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="text-xl font-bold whitespace-nowrap tabular-nums sm:text-2xl">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${
              trend >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"
            }`}
          >
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend >= 0 ? "+" : ""}
            {trend}% {trendLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const [range, setRange] = useState("3m");
  const { from, to } = getDateRange(range);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics", from, to],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/bookings/stats/analytics`,
        {
          params: { dateFrom: from, dateTo: to },
        }
      );
      return normalizeAnalytics(data);
    },
  });

  const revenueData = data?.revenueOverTime ?? [];
  const tourData = data?.bookingsByTour ?? [];
  const sourceData = data?.bookingsBySource ?? [];
  const slotData = data?.popularTimeSlots ?? [];
  const guides = data?.revenuePerGuide ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-description">
            {from} — {to}
          </p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
          Loading analytics...
        </div>
      ) : isError || !data ? (
        <div className="flex items-center justify-center h-64 text-destructive text-sm">
          Could not load analytics. Try again in a moment.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Revenue"
              value={`€${(data?.kpis.totalRevenue ?? 0).toLocaleString()}`}
              icon={Euro}
              iconClass="text-emerald-700 dark:text-emerald-400"
              trend={data?.revenueGrowth}
              trendLabel="vs last month"
            />
            <KPICard
              title="Total Bookings"
              value={String(data?.kpis.totalBookings ?? 0)}
              icon={Calendar}
              iconClass="text-blue-600 dark:text-blue-400"
              trend={data?.bookingsGrowth}
              trendLabel="vs last month"
            />
            <KPICard
              title="Cancellation Rate"
              value={`${data?.kpis.cancellationRate ?? 0}%`}
              subtitle="of all bookings"
              icon={XCircle}
              iconClass={
                (data?.kpis.cancellationRate ?? 0) > 15
                  ? "text-destructive"
                  : "text-muted-foreground"
              }
            />
            <KPICard
              title="Avg Group Size"
              value={`${data?.kpis.avgGroupSize ?? 0} guests`}
              subtitle="per booking"
              icon={Users}
              iconClass="text-purple-600 dark:text-purple-400"
            />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Revenue Over Time
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {data?.kpis.totalBookings ?? 0} bookings · €
                  {(data?.kpis.totalRevenue ?? 0).toLocaleString()} total
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis dataKey="month" tick={AXIS_TICK} />
                  <YAxis
                    tick={AXIS_TICK}
                    tickFormatter={(v) => `€${v}`}
                  />
                  <Tooltip
                    formatter={(value) => [`€${value}`, "Revenue"]}
                    contentStyle={TOOLTIP_STYLE}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Bookings by Tour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={tourData}
                    layout="vertical"
                    margin={{ left: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis type="number" tick={AXIS_TICK} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={AXIS_TICK}
                      width={160}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar
                      dataKey="bookings"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Popular Time Slots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={slotData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis dataKey="slot" tick={AXIS_TICK} />
                    <YAxis tick={AXIS_TICK} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar
                      dataKey="bookings"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Bookings by Source
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {sourceData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="space-y-1.5 text-sm">
                  {sourceData.map((entry, i) => (
                    <li key={entry.name} className="flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ background: COLORS[i % COLORS.length] }}
                      />
                      <span className="flex-1 capitalize">{entry.name}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {entry.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                  Guide Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {guides.map((g, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {g.guideName}
                          </p>
                          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 shrink-0 ml-2">
                            €{g.revenue.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-muted-foreground">
                            {g.position}
                          </p>
                          <span className="text-muted-foreground">·</span>
                          <p className="text-xs text-muted-foreground">
                            {g.toursLed} tours
                          </p>
                        </div>
                        <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width: `${
                                guides[0].revenue > 0
                                  ? (g.revenue / guides[0].revenue) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
