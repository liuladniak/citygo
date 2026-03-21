import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/apiClient";
import { format, subMonths, subYears, startOfYear } from "date-fns";
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
  icon: any;
  iconClass?: string;
  trend?: number;
  trendLabel?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className={`p-1.5 rounded-lg bg-muted/50 ${iconClass}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${
              trend >= 0 ? "text-emerald-500" : "text-destructive"
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

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", from, to],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/bookings/stats/analytics`,
        {
          params: { dateFrom: from, dateTo: to },
        }
      );
      return data;
    },
  });

  const revenueData =
    data?.revenue_over_time?.map((r: any) => ({
      month: r.month,
      revenue: parseFloat(r.revenue),
      bookings: parseInt(r.bookings),
    })) ?? [];

  const tourData =
    data?.bookings_by_tour?.map((t: any) => ({
      name:
        t.tour_name.length > 25 ? t.tour_name.slice(0, 25) + "…" : t.tour_name,
      bookings: parseInt(t.bookings),
      revenue: parseFloat(t.revenue ?? 0),
    })) ?? [];

  const sourceData =
    data?.bookings_by_source?.map((s: any) => ({
      name: s.source.replace("_", " "),
      value: parseInt(s.count),
    })) ?? [];

  const slotData =
    data?.popular_time_slots?.map((s: any) => ({
      slot: s.slot.slice(0, 5) + "–" + s.slot.slice(9, 14),
      bookings: parseInt(s.bookings),
    })) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
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
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Revenue"
              value={`€${data?.kpis?.total_revenue?.toLocaleString()}`}
              icon={Euro}
              iconClass="text-emerald-500"
              trend={data?.mom_growth?.revenue_growth}
              trendLabel="vs last month"
            />
            <KPICard
              title="Total Bookings"
              value={data?.kpis?.total_bookings}
              icon={Calendar}
              iconClass="text-blue-500"
              trend={data?.mom_growth?.bookings_growth}
              trendLabel="vs last month"
            />
            <KPICard
              title="Cancellation Rate"
              value={`${data?.kpis?.cancellation_rate}%`}
              subtitle="of all bookings"
              icon={XCircle}
              iconClass={
                data?.kpis?.cancellation_rate > 15
                  ? "text-destructive"
                  : "text-muted-foreground"
              }
            />
            <KPICard
              title="Avg Group Size"
              value={`${data?.kpis?.avg_group_size} guests`}
              subtitle="per booking"
              icon={Users}
              iconClass="text-purple-500"
            />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Revenue Over Time
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {data?.kpis?.total_bookings} bookings · €
                  {data?.kpis?.total_revenue?.toLocaleString()} total
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
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `€${v}`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`€${value}`, "Revenue"]}
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
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      width={160}
                    />
                    <Tooltip />
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
                    <XAxis dataKey="slot" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
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
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {sourceData.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  Guide Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.revenue_per_guide?.map((g: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {g.guide_name}
                          </p>
                          <p className="text-sm font-semibold text-emerald-500 shrink-0 ml-2">
                            €{parseFloat(g.revenue).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-muted-foreground">
                            {g.position}
                          </p>
                          <span className="text-muted-foreground">·</span>
                          <p className="text-xs text-muted-foreground">
                            {g.tours_led} tours
                          </p>
                        </div>
                        <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width: `${
                                (parseFloat(g.revenue) /
                                  parseFloat(
                                    data.revenue_per_guide[0].revenue
                                  )) *
                                100
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
