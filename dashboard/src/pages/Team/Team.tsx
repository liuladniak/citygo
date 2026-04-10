import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/apiClient";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Plus, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddEmployeeModal from "@/components/modals/AddEmployeeModal";
import EmployeePanel from "@/components/panels/EmployeePanel";

const FIELD_POSITIONS = ["Lead Guide", "Assistant Guide", "Driver"];
const API_URL = import.meta.env.VITE_API_URL;

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  profile_image: string | null;
  status: string;
  employment_type: string | null;
  languages: string[] | null;
  availability: "available" | "on_tour" | "offline";
  on_tour_now: boolean;
  has_tour_today: boolean;
  tours_today: number;
}

const availabilityConfig = {
  on_tour: { dot: "bg-blue-500", label: "On Tour", class: "text-blue-500" },
  available: {
    dot: "bg-emerald-500",
    label: "Available",
    class: "text-emerald-500",
  },
  offline: {
    dot: "bg-muted-foreground/30",
    label: "Offline",
    class: "text-muted-foreground",
  },
};

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

function EmployeeCard({
  employee,
  onClick,
}: {
  employee: Employee;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  const initials = `${employee.first_name[0]}${employee.last_name[0]}`;
  const colorIndex =
    (employee.first_name.charCodeAt(0) + employee.last_name.charCodeAt(0)) %
    colors.length;
  const bgColor = colors[colorIndex];
  const avail = availabilityConfig[employee.availability];

  const photoUrl =
    employee.profile_image && !imgError
      ? employee.profile_image.startsWith("http")
        ? employee.profile_image
        : `${API_URL}/public/employees/${employee.profile_image}`
      : null;

  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="relative">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={initials}
              onError={() => setImgError(true)}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div
              className={`w-12 h-12 rounded-full ${bgColor} text-white flex items-center justify-center text-sm font-semibold`}
            >
              {initials}
            </div>
          )}
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${avail.dot}`}
          />
        </div>
        <span className={`text-xs font-medium ${avail.class}`}>
          {employee.on_tour_now
            ? "On Tour"
            : employee.has_tour_today
            ? "Tour Later"
            : avail.label}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-foreground truncate">
        {employee.first_name} {employee.last_name}
      </h3>
      <p className="text-xs text-muted-foreground mt-0.5 truncate">
        {employee.position}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {employee.employment_type && (
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 h-4 capitalize"
          >
            {employee.employment_type.replace("_", " ")}
          </Badge>
        )}
        {FIELD_POSITIONS.includes(employee.position) &&
          employee.tours_today > 0 && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 text-blue-500 border-blue-200"
            >
              {employee.tours_today} tour{employee.tours_today > 1 ? "s" : ""}{" "}
              today
            </Badge>
          )}
        {employee.languages?.[0] && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
            {employee.languages[0]}
            {employee.languages.length > 1
              ? ` +${employee.languages.length - 1}`
              : ""}
          </Badge>
        )}
      </div>
    </div>
  );
}

export default function Team() {
  const { user } = useAuth();
  const { role } = useRole(user?.id);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);

  if (role === "associate") return <Navigate to="/" replace />;

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["employees-availability"],
    queryFn: async () => {
      const { data } = await axios.get(`/api/employees/availability`);
      return data;
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const positions = [...new Set(employees.map((e) => e.position))].sort();

  const filtered = employees.filter((e) => {
    const matchSearch = search
      ? `${e.first_name} ${e.last_name}`
          .toLowerCase()
          .includes(search.toLowerCase())
      : true;
    const matchPosition =
      positionFilter !== "all" ? e.position === positionFilter : true;
    const matchAvailability =
      availabilityFilter !== "all"
        ? e.availability === availabilityFilter
        : true;
    return matchSearch && matchPosition && matchAvailability;
  });

  const counts = {
    total: employees.length,
    available: employees.filter((e) => e.availability === "available").length,
    on_tour: employees.filter((e) => e.on_tour_now).length,
    offline: employees.filter((e) => e.availability === "offline").length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {counts.total} members · {counts.available} available
          </p>
        </div>
        {role === "admin" && (
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: counts.total, color: "text-foreground" },
          {
            label: "Available",
            value: counts.available,
            color: "text-emerald-500",
          },
          { label: "On Tour", value: counts.on_tour, color: "text-blue-500" },
          {
            label: "Offline",
            value: counts.offline,
            color: "text-muted-foreground",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-xl px-4 py-3"
          >
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 w-48"
          />
        </div>
        <Select value={positionFilter} onValueChange={setPositionFilter}>
          <SelectTrigger className="h-9 w-44">
            <SelectValue placeholder="All Positions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Positions</SelectItem>
            {positions.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={availabilityFilter}
          onValueChange={setAvailabilityFilter}
        >
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="on_tour">On Tour</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-4 h-36 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No team members found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((emp) => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              onClick={() => setSelectedId(emp.id)}
            />
          ))}
        </div>
      )}

      <EmployeePanel
        employeeId={selectedId}
        onClose={() => setSelectedId(null)}
        isAdmin={role === "admin"}
      />
      <AddEmployeeModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() =>
          queryClient.invalidateQueries({
            queryKey: ["employees-availability"],
          })
        }
      />
    </div>
  );
}
