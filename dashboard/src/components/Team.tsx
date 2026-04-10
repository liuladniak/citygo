import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/apiClient";
import { ArrowRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const FIELD_POSITIONS = ["Lead Guide", "Assistant Guide", "Driver"];
const API_URL = import.meta.env.VITE_API_URL;

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  profile_image: string | null;
  availability: "available" | "on_tour" | "offline";
  on_tour_now: boolean;
  has_tour_today: boolean;
  tours_today: number;
}

const availabilityConfig = {
  on_tour: {
    dot: "bg-blue-500",
    label: "On tour",
    labelClass: "text-blue-500",
  },
  available: {
    dot: "bg-emerald-500",
    label: "Available",
    labelClass: "text-emerald-600 dark:text-emerald-400",
  },
  offline: {
    dot: "bg-muted-foreground/30",
    label: "Offline",
    labelClass: "text-muted-foreground",
  },
};

function Avatar({ employee }: { employee: Employee }) {
  const [imgError, setImgError] = useState(false);
  const initials = `${employee.first_name[0]}${employee.last_name[0]}`;
  const config = availabilityConfig[employee.availability];

  const colors = [
    "bg-violet-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-cyan-500",
    "bg-amber-500",
    "bg-rose-500",
  ];
  const colorIndex =
    (employee.first_name.charCodeAt(0) + employee.last_name.charCodeAt(0)) %
    colors.length;
  const bgColor = colors[colorIndex];

  const photoUrl =
    employee.profile_image && !imgError
      ? employee.profile_image.startsWith("http")
        ? employee.profile_image
        : `${API_URL}/public/employees/${employee.profile_image}`
      : null;

  return (
    <div className="relative shrink-0">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={`${employee.first_name} ${employee.last_name}`}
          className="w-8 h-8 rounded-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={`w-8 h-8 rounded-full ${bgColor} text-white flex items-center justify-center text-xs font-semibold`}
        >
          {initials}
        </div>
      )}
      <span
        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${config.dot}`}
      />
    </div>
  );
}
export default function Team() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "available" | "field">("all");

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["employees-availability"],
    queryFn: async () => {
      const { data } = await axios.get(`/api/employees/availability`);
      return data;
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const onTourCount = employees.filter((e) => e.on_tour_now).length;
  const availableCount = employees.filter(
    (e) => e.availability === "available"
  ).length;

  const filtered = employees.filter((e) => {
    if (filter === "available") return e.availability === "available";
    if (filter === "field") return FIELD_POSITIONS.includes(e.position);
    return true;
  });

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-sm font-semibold">Team</h1>
          <span className="text-xs text-muted-foreground">
            ({employees.length})
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground h-7 px-2 hover:text-foreground"
          onClick={() => navigate("/team")}
        >
          View all
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          {
            label: "Total",
            value: employees.length,
            color: "text-foreground",
          },
          {
            label: "Available",
            value: availableCount,
            color: "text-emerald-500",
          },
          {
            label: "On Tour",
            value: onTourCount,
            color: "text-blue-500",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-muted/40 rounded-lg px-2 py-1.5 text-center"
          >
            <p className={`text-base font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-3">
        {(["all", "available", "field"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors capitalize ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {f === "field"
              ? "Field Staff"
              : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <ScrollArea className="h-[360px]">
        <div className="flex flex-col pb-4 pr-3">
          {filtered.map((emp, i) => {
            const config = availabilityConfig[emp.availability];
            return (
              <div
                key={emp.id}
                className={`flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer ${
                  i < filtered.length - 1 ? "border-b border-border/40" : ""
                }`}
              >
                <Avatar employee={emp} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {emp.first_name} {emp.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {emp.position}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xs font-medium ${config.labelClass}`}>
                    {config.label}
                  </p>
                  {emp.has_tour_today && !emp.on_tour_now && (
                    <p className="text-[10px] text-muted-foreground">
                      Tour later
                    </p>
                  )}
                  {emp.tours_today > 0 && emp.on_tour_now && (
                    <p className="text-[10px] text-muted-foreground">
                      {emp.tours_today} tour{emp.tours_today > 1 ? "s" : ""}{" "}
                      today
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
