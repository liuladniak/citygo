import { useCallback, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/apiClient";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  CreditCard,
  ExternalLink,
  MapPin,
  User,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const statusColors: Record<string, string> = {
  confirmed: "#10b981",
  pending: "#f59e0b",
  cancelled: "#ef4444",
  completed: "#3b82f6",
  draft: "#6b7280",
};

const statusConfig: Record<string, { label: string; class: string }> = {
  confirmed: {
    label: "Confirmed",
    class:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
  },
  pending: {
    label: "Pending",
    class:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
  },
  cancelled: {
    label: "Cancelled",
    class:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400",
  },
  completed: {
    label: "Completed",
    class:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
  },
};

export default function Schedule() {
  const navigate = useNavigate();
  const calendarRef = useRef<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [guideFilter, setGuideFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentRange, setCurrentRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["schedule-bookings", currentRange.start, currentRange.end],
    queryFn: async () => {
      const { data } = await axios.get(`/api/bookings/all`, {
        params: {
          dateFrom: format(currentRange.start, "yyyy-MM-dd"),
          dateTo: format(currentRange.end, "yyyy-MM-dd"),
          limit: 200,
        },
      });
      return data.data;
    },
  });

  const guides: string[] = Array.from(
    new Set(
      bookings.flatMap((b: any) => b.staff?.map((s: any) => s.guide_name) ?? [])
    )
  ).sort() as string[];

  const events = bookings
    .filter((b: any) => {
      if (b.status === "cancelled") return false;
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (guideFilter !== "all") {
        const hasGuide = b.staff?.some(
          (s: any) => s.guide_name === guideFilter
        );
        if (!hasGuide) return false;
      }
      return true;
    })
    .map((b: any) => {
      const date = b.tour_date.split("T")[0];
      const startTime = b.display_start_time?.slice(0, 5) ?? "00:00";
      const endTime = b.display_end_time?.slice(0, 5) ?? "01:00";
      const guests = b.total_guests ?? "?";
      return {
        id: String(b.id),
        title: `${b.tour_name ?? "Custom Tour"} · ${guests}👥`,
        start: `${date}T${startTime}`,
        end: `${date}T${endTime}`,
        backgroundColor: statusColors[b.status] ?? "#6b7280",
        borderColor: statusColors[b.status] ?? "#6b7280",
        extendedProps: { booking: b },
      };
    });

  const handleEventClick = useCallback((info: any) => {
    setSelectedBooking(info.event.extendedProps.booking);
  }, []);

  const handleDatesSet = useCallback((info: any) => {
    setCurrentRange({ start: info.start, end: info.end });
  }, []);

  const handlePrintDay = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const todayBookings = bookings.filter(
      (b: any) => b.tour_date?.startsWith(today) && b.status !== "cancelled"
    );
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head>
        <title>Schedule — ${format(new Date(), "MMMM d, yyyy")}</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 2rem; color: #111; }
          h1 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem; }
          p { color: #666; font-size: 0.875rem; margin-bottom: 1.5rem; }
          table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
          th { text-align: left; padding: 8px 12px; background: #f5f5f5; border-bottom: 2px solid #ddd; font-weight: 600; }
          td { padding: 8px 12px; border-bottom: 1px solid #eee; vertical-align: top; }
          .ref { color: #888; font-size: 0.75rem; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: 600; }
          .confirmed { background: #d1fae5; color: #065f46; }
          .pending { background: #fef3c7; color: #92400e; }
        </style>
      </head><body>
        <h1>Daily Schedule</h1>
        <p>${format(new Date(), "EEEE, MMMM d, yyyy")} · CityGo Tours</p>
        ${
          todayBookings.length === 0
            ? "<p>No tours scheduled today.</p>"
            : `<table><thead><tr>
            <th>Time</th><th>Tour</th><th>Guests</th>
            <th>Staff</th><th>Meeting Point</th><th>Status</th>
          </tr></thead><tbody>
          ${todayBookings
            .map(
              (b: any) => `<tr>
            <td>${b.display_start_time?.slice(0, 5) ?? "—"}${
                b.display_end_time ? ` – ${b.display_end_time.slice(0, 5)}` : ""
              }</td>
            <td>${b.tour_name ?? "Custom Tour"}<br/><span class="ref">${
                b.booking_reference
              }</span></td>
            <td>${b.total_guests ?? "—"}</td>
            <td>${
              b.staff?.map((s: any) => s.guide_name).join(", ") || "Unassigned"
            }</td>
            <td>${b.meeting_point ?? "—"}</td>
            <td><span class="badge ${b.status}">${b.status}</span></td>
          </tr>`
            )
            .join("")}
          </tbody></table>`
        }
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const booking = selectedBooking;
  const statusCfg = statusConfig[booking?.status] ?? {
    label: booking?.status,
    class: "",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tour operations calendar
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={guideFilter} onValueChange={setGuideFilter}>
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue placeholder="All guides" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Guides</SelectItem>
              {guides.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handlePrintDay}>
            Print Today
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground pl-2">
            {Object.entries(statusColors)
              .filter(([k]) => k !== "draft")
              .map(([status, color]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="capitalize">{status}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <style>{`
          .fc { font-family: inherit; color: hsl(var(--foreground)); }
          .fc-toolbar-title { font-size: 1rem !important; font-weight: 600 !important; color: hsl(var(--foreground)); }
          .fc-button { font-size: 0.75rem !important; padding: 0.25rem 0.75rem !important; background-color: hsl(var(--secondary)) !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; border-radius: 6px !important; box-shadow: none !important; }
          .fc-button:hover { background-color: hsl(var(--accent)) !important; }
          .fc-button-primary.fc-button-active, .fc-button-primary:not(.fc-button-active):focus { background-color: hsl(var(--primary)) !important; border-color: hsl(var(--primary)) !important; color: hsl(var(--primary-foreground)) !important; box-shadow: none !important; }
          .fc-today-button { background-color: hsl(var(--primary)) !important; border-color: hsl(var(--primary)) !important; color: hsl(var(--primary-foreground)) !important; }
          .fc-event { cursor: pointer; font-size: 0.7rem !important; padding: 2px 4px !important; border-radius: 4px !important; border: none !important; font-weight: 500 !important; }
          .fc-event:hover { opacity: 0.85; }
          .fc-day-today { background-color: hsl(var(--primary)/0.06) !important; }
          .fc-col-header-cell { font-size: 0.7rem !important; font-weight: 600 !important; text-transform: uppercase; letter-spacing: 0.05em; background: hsl(var(--muted)/0.5); color: hsl(var(--muted-foreground)); padding: 6px !important; }
          .fc-daygrid-day-number { font-size: 0.75rem !important; color: hsl(var(--muted-foreground)); padding: 4px 6px !important; }
          .fc-day-today .fc-daygrid-day-number { background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin: 2px; }
          .fc th, .fc td { border-color: hsl(var(--border)) !important; }
          .fc-scrollgrid { border-color: hsl(var(--border)) !important; border-radius: 0 !important; }
          .fc-toolbar { padding: 1rem 1.25rem !important; border-bottom: 1px solid hsl(var(--border)); }
          .fc-view-harness { background: hsl(var(--card)); }
          .fc-more-link, .fc-daygrid-more-link { color: hsl(var(--primary)) !important; font-size: 0.65rem !important; }
          .fc-popover { background: hsl(var(--card)) !important; border: 1px solid hsl(var(--border)) !important; border-radius: 8px !important; box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; }
          .fc-popover-header { background: hsl(var(--muted)) !important; color: hsl(var(--foreground)) !important; border-radius: 8px 8px 0 0 !important; font-size: 0.75rem !important; padding: 6px 10px !important; }
          .fc-list-event { cursor: pointer; }
.fc-list-event:hover td { background: hsl(var(--muted)/0.5) !important; }
.fc-list-day-cushion { background: hsl(var(--muted)/0.3) !important; }
.fc-list-event-dot { border-color: inherit !important; }
.fc-list-empty { color: hsl(var(--muted-foreground)); font-size: 0.875rem; }
.fc-list-day-text, .fc-list-day-side-text { color: hsl(var(--foreground)) !important; font-size: 0.75rem !important; }
        `}</style>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
          navLinks={true}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,listWeek",
          }}
          buttonText={{
            today: "Today",
            month: "Month",
            week: "Week List",
          }}
          events={events}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          height="auto"
          dayMaxEvents={4}
          nowIndicator={true}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
        />
      </div>

      <Sheet
        open={!!selectedBooking}
        onOpenChange={(o) => {
          if (!o) setSelectedBooking(null);
        }}
      >
        <SheetContent className="w-full sm:w-[440px] overflow-y-auto p-0">
          {booking && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4 pr-12 border-b border-border">
                <div className="flex items-start justify-between gap-2">
                  <SheetTitle className="text-base leading-snug">
                    {booking.tour_name ?? "Custom Tour"}
                  </SheetTitle>
                  <Badge variant="outline" className={statusCfg.class}>
                    {statusCfg.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {booking.booking_reference}
                </p>
              </SheetHeader>

              <div className="px-6 py-5 space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>
                      {format(
                        new Date(booking.tour_date),
                        "EEEE, MMMM d, yyyy"
                      )}
                    </span>
                  </div>
                  {booking.display_start_time && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>
                        {booking.display_start_time.slice(0, 5)}
                        {booking.display_end_time &&
                          ` – ${booking.display_end_time.slice(0, 5)}`}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Guest
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{booking.primary_contact_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{booking.total_guests ?? "—"} guests</span>
                  </div>
                </div>

                <Separator />

                {booking.staff?.length > 0 && (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Assigned Staff
                      </p>
                      {booking.staff.map((s: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm"
                        >
                          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{s.guide_name}</span>
                          <span className="text-xs text-muted-foreground capitalize">
                            · {s.role?.replace("_", " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Separator />
                  </>
                )}

                {booking.meeting_point && (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Meeting Point
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{booking.meeting_point}</span>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Payment
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>
                        €{parseFloat(booking.amount_paid ?? 0).toFixed(0)} paid
                      </span>
                    </div>
                    {parseFloat(booking.total_price ?? 0) >
                      parseFloat(booking.amount_paid ?? 0) && (
                      <span className="text-xs text-red-500 font-medium">
                        €
                        {(
                          parseFloat(booking.total_price) -
                          parseFloat(booking.amount_paid)
                        ).toFixed(0)}{" "}
                        due
                      </span>
                    )}
                    {parseFloat(booking.amount_paid ?? 0) >=
                      parseFloat(booking.total_price ?? 0) &&
                      parseFloat(booking.total_price ?? 0) > 0 && (
                        <span className="text-xs text-emerald-500 font-medium">
                          Paid in full
                        </span>
                      )}
                  </div>
                </div>

                <Separator />

                <Button
                  className="w-full"
                  onClick={() => {
                    navigate(`/bookings/${booking.id}`);
                    setSelectedBooking(null);
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Booking
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
