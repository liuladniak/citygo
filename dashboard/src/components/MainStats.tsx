import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/apiClient";
import {
  CalendarDays,
  AlertTriangle,
  CloudRain,
  Sun,
  Cloud,
  CloudSnow,
  Wind,
  TrendingUp,
  TrendingDown,
  Euro,
} from "lucide-react";


interface DashboardStats {
  tours_today: number;
  guests_today: number;
  currently_running: number;
  revenue_today: number;
  expected_revenue_today: number;
  urgent_tasks: number;
  unpaid_bookings: number;
  tours_trend: number;
}

interface WeatherData {
  temp: number;
  feels_like: number;
  condition: string;
  description: string;
  wind_speed: number;
  humidity: number;
  forecast: {
    time: string;
    temp_max: number;
    temp_min: number;
    condition: string;
  }[];
}

function wmoToCondition(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Clouds";
  if (code <= 49) return "Fog";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain";
  if (code <= 86) return "Snow";
  if (code <= 99) return "Thunderstorm";
  return "Clear";
}

function wmoToDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 49) return "Foggy";
  if (code <= 55) return "Drizzle";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowy";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

function WeatherIcon({
  condition,
  size = 14,
}: {
  condition: string;
  size?: number;
}) {
  const c = condition.toLowerCase();
  const style = { width: size, height: size, flexShrink: 0 };
  if (c.includes("rain") || c.includes("drizzle"))
    return <CloudRain style={style} />;
  if (c.includes("snow")) return <CloudSnow style={style} />;
  if (c.includes("cloud")) return <Cloud style={style} />;
  if (c.includes("thunder")) return <CloudRain style={style} />;
  if (c.includes("fog")) return <Wind style={style} />;
  return <Sun style={style} />;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
  trend,
  valueClass,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  iconClass?: string;
  trend?: number;
  valueClass?: string;
}) {
  return (
    <div className="flex-1 rounded-xl border border-border bg-card px-5 py-4 shadow-sm flex flex-col justify-between min-h-[110px]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <div className={`${iconClass}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div>
        <p className={`text-2xl font-bold ${valueClass ?? "text-foreground"}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
            {subtitle}
          </p>
        )}
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 mt-1 text-xs font-medium ${
              trend >= 0 ? "text-emerald-500" : "text-destructive"
            }`}
          >
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend >= 0 ? "+" : ""}
            {trend}% vs last month
          </div>
        )}
      </div>
    </div>
  );
}
function WeatherCard({ data }: { data: WeatherData }) {
  const isGoodWeather =
    !data.condition.toLowerCase().includes("rain") &&
    !data.condition.toLowerCase().includes("snow") &&
    !data.condition.toLowerCase().includes("storm");

  return (
    <div className="flex-1 rounded-xl border border-border bg-card px-5 py-4 shadow-sm flex flex-col justify-between min-h-[110px]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          Istanbul Weather
        </p>
        <WeatherIcon condition={data.condition} size={14} />
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-1.5">
            <p className="text-2xl font-bold text-foreground">
              {Math.round(data.temp)}°
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {data.description}
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Feels {Math.round(data.feels_like)}° · {data.wind_speed}m/s ·{" "}
            {data.humidity}%
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {data.forecast.map((f, i) => (
            <div
              key={i}
              className="flex flex-col items-center bg-muted/40 rounded-lg px-2 py-1.5 gap-0.5"
            >
              <p className="text-[10px] text-muted-foreground">{f.time}</p>
              <WeatherIcon condition={f.condition} size={12} />
              <p className="text-[10px] font-medium">
                {Math.round(f.temp_max)}°
              </p>
            </div>
          ))}
        </div>
      </div>
      {!isGoodWeather && (
        <p className="text-[10px] text-amber-500 font-medium flex items-center gap-1 mt-1">
          <AlertTriangle className="h-2.5 w-2.5" />
          Weather advisory — check meeting points
        </p>
      )}
    </div>
  );
}
export default function MainStats() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/bookings/stats/dashboard`
      );
      return data;
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: weather } = useQuery<WeatherData>({
    queryKey: ["weather"],
    queryFn: async () => {
      const lat = 41.0082;
      const lon = 28.9784;

      const res = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Europe/Istanbul&forecast_days=4`
      );

      const current = res.data.current;
      const daily = res.data.daily;

      const forecast = [1, 2, 3].map((i) => ({
        time: new Date(daily.time[i]).toLocaleDateString("en", {
          weekday: "short",
        }),
        temp_max: daily.temperature_2m_max[i],
        temp_min: daily.temperature_2m_min[i],
        condition: wmoToCondition(daily.weathercode[i]),
      }));

      return {
        temp: current.temperature_2m,
        feels_like: current.apparent_temperature,
        condition: wmoToCondition(current.weathercode),
        description: wmoToDescription(current.weathercode),
        wind_speed: current.windspeed_10m,
        humidity: current.relativehumidity_2m,
        forecast,
      };
    },
    refetchInterval: 30 * 60 * 1000,
  });

  const issuesCount =
    (stats?.urgent_tasks ?? 0) + (stats?.unpaid_bookings ?? 0);

  return (
    <div className="flex justify-between gap-4">
      <StatCard
        title="Tours Today"
        value={stats?.tours_today ?? "—"}
        subtitle={
          stats?.guests_today
            ? `${stats.guests_today} guests expected`
            : "No tours scheduled"
        }
        icon={CalendarDays}
        iconClass="text-blue-500"
        trend={stats?.tours_trend}
      />
      <StatCard
        title="Revenue Today"
        value={stats ? `€${stats.revenue_today.toFixed(0)}` : "—"}
        subtitle={
          stats?.expected_revenue_today
            ? `€${stats.expected_revenue_today.toFixed(0)} expected`
            : undefined
        }
        icon={Euro}
        iconClass="text-emerald-500"
        valueClass={stats?.revenue_today === 0 ? "text-muted-foreground" : ""}
      />
      <StatCard
        title="Open Issues"
        value={issuesCount}
        subtitle={
          issuesCount === 0
            ? "All clear"
            : `${stats?.urgent_tasks ?? 0} urgent tasks · ${
                stats?.unpaid_bookings ?? 0
              } unpaid`
        }
        icon={AlertTriangle}
        iconClass={issuesCount > 0 ? "text-amber-500" : "text-muted-foreground"}
        valueClass={issuesCount > 0 ? "text-amber-500" : ""}
      />
      {weather ? (
        <WeatherCard data={weather} />
      ) : (
        <div className="flex-1 rounded-xl border border-border bg-card p-5 shadow-sm animate-pulse" />
      )}
    </div>
  );
}
