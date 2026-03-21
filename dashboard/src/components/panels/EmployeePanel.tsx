import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/apiClient";
import {
  Award,
  Briefcase,
  Calendar,
  Clock,
  Languages,
  Mail,
  Phone,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { format } from "date-fns";
import DeactivateEmployeeModal from "../modals/DeactivateEmployeeModal";
import EditEmployeeModal from "../modals/EditEmployeeModal";

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

interface Props {
  employeeId: number | null;
  onClose: () => void;
  isAdmin: boolean;
}

const API_URL = import.meta.env.VITE_API_KEY;
export default function EmployeePanel({ employeeId, onClose, isAdmin }: Props) {
  const queryClient = useQueryClient();
  const [imgError, setImgError] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const { data: emp, isLoading } = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/employees/${employeeId}`);
      return data;
    },
    enabled: !!employeeId,
  });

  const { data: availabilityData = [] } = useQuery({
    queryKey: ["employees-availability"],
    queryFn: async () => {
      const { data } = await axios.get(`/api/employees/availability`);
      return data;
    },
    enabled: !!employeeId,
  });

  const availInfo = availabilityData.find((e: any) => e.id === employeeId);
  const avail =
    availabilityConfig[
      availInfo?.availability as keyof typeof availabilityConfig
    ] ?? availabilityConfig.offline;

  const initials = emp ? `${emp.first_name[0]}${emp.last_name[0]}` : "";
  const colorIndex = emp
    ? (emp.first_name.charCodeAt(0) + emp.last_name.charCodeAt(0)) %
      colors.length
    : 0;
  const bgColor = colors[colorIndex];

  const photoUrl =
    emp?.profile_image && !imgError
      ? emp.profile_image.startsWith("http")
        ? emp.profile_image
        : `${API_URL}/public/employees/${emp.profile_image}`
      : null;

  return (
    <Sheet
      open={!!employeeId}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <SheetContent className="w-full sm:w-[480px] p-0 flex flex-col">
        {isLoading || !emp ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-muted-foreground text-sm">
              Loading...
            </div>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-border pr-14">
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={initials}
                      onError={() => setImgError(true)}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-16 h-16 rounded-full ${bgColor} text-white flex items-center justify-center text-lg font-semibold`}
                    >
                      {initials}
                    </div>
                  )}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${avail.dot}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold truncate">
                    {emp.first_name} {emp.last_name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {emp.position}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-xs font-medium ${avail.class}`}>
                      {availInfo?.on_tour_now
                        ? "On Tour Now"
                        : availInfo?.has_tour_today
                        ? "Tour Later Today"
                        : avail.label}
                    </span>
                    {emp.employment_type && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {emp.employment_type.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditOpen(true)}
                  >
                    Edit
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  { label: "Total Tours", value: emp.stats?.total_tours ?? 0 },
                  {
                    label: "This Month",
                    value: emp.stats?.tours_this_month ?? 0,
                  },
                  { label: "Today", value: availInfo?.tours_today ?? 0 },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-muted/40 rounded-lg px-3 py-2 text-center"
                  >
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Contact
                  </h3>
                  {emp.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>{emp.email}</span>
                    </div>
                  )}
                  {emp.work_email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>{emp.work_email}</span>
                      <Badge variant="outline" className="text-[10px] h-4 px-1">
                        work
                      </Badge>
                    </div>
                  )}
                  {emp.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                </section>

                <Separator />

                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Employment
                  </h3>
                  {emp.contract_start && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>
                        Since {format(new Date(emp.contract_start), "MMM yyyy")}
                      </span>
                    </div>
                  )}
                  {emp.shift_start && emp.shift_end && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>
                        {emp.shift_start.slice(0, 5)} –{" "}
                        {emp.shift_end.slice(0, 5)}
                      </span>
                    </div>
                  )}
                </section>

                <Separator />

                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Skills & Qualifications
                  </h3>
                  {emp.languages?.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Languages className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {emp.languages.map((l: string) => (
                          <Badge key={l} variant="outline" className="text-xs">
                            {l}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {emp.licences?.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Award className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {emp.licences.map((l: string) => (
                          <Badge key={l} variant="outline" className="text-xs">
                            {l}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {emp.skills?.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {emp.skills.map((s: string) => (
                          <Badge key={s} variant="outline" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                <Separator />

                {isAdmin && emp.emergency_contact_name && (
                  <>
                    <section className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Emergency Contact
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{emp.emergency_contact_name}</span>
                        {emp.emergency_contact_relation && (
                          <span className="text-muted-foreground">
                            · {emp.emergency_contact_relation}
                          </span>
                        )}
                      </div>
                      {emp.emergency_contact_phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{emp.emergency_contact_phone}</span>
                        </div>
                      )}
                    </section>
                    <Separator />
                  </>
                )}

                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Upcoming Assignments{" "}
                    {emp.upcoming_assignments?.length > 0 &&
                      `(${emp.upcoming_assignments.length})`}
                  </h3>
                  {emp.upcoming_assignments?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No upcoming assignments.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {emp.upcoming_assignments.map((a: any) => (
                        <div
                          key={a.booking_id}
                          className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/40"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">
                              {a.tour_name ?? "Custom Tour"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {format(new Date(a.tour_date), "EEE, MMM d")}
                              {a.start_time && ` · ${a.start_time.slice(0, 5)}`}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[10px] shrink-0"
                          >
                            {a.booking_reference}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <Separator />

                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Recent History{" "}
                    {emp.past_assignments?.length > 0 &&
                      `(${emp.past_assignments.length})`}
                  </h3>
                  {emp.past_assignments?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No past assignments.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {emp.past_assignments.map((a: any) => (
                        <div
                          key={a.booking_id}
                          className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/40"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">
                              {a.tour_name ?? "Custom Tour"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {format(new Date(a.tour_date), "EEE, MMM d yyyy")}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[10px] shrink-0"
                          >
                            {a.booking_reference}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {isAdmin && (
                  <>
                    <Separator />
                    <section className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Notes
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {emp.notes ?? "No notes added."}
                      </p>
                    </section>
                  </>
                )}
              </div>
            </ScrollArea>

            {isAdmin && (
              <div className="p-4 border-t border-border flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditOpen(true)}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive flex-1"
                  onClick={() => setDeactivateOpen(true)}
                >
                  Deactivate
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
      <EditEmployeeModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        employee={emp}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
          queryClient.invalidateQueries({
            queryKey: ["employees-availability"],
          });
        }}
      />
      <DeactivateEmployeeModal
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        employee={emp}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["employees-availability"],
          });
          queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
          onClose();
        }}
      />
    </Sheet>
  );
}
