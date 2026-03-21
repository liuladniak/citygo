import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { Calendar, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { toast } from "sonner";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface UnavailableDate {
  id: number;
  unavailable_date: string;
  reason: string | null;
}

interface RecurringUnavailability {
  id: number;
  day_of_week: number;
  reason: string | null;
}

interface Props {
  slug?: string;
}

export default function AvailabilityManager({ slug }: Props) {
  const queryClient = useQueryClient();

  const isAgency = !slug;
  const queryKey = isAgency
    ? ["agency-availability"]
    : ["tour-availability", slug];
  const fetchUrl = isAgency
    ? "/api/company/availability"
    : `/api/tours/${slug}/unavailable-dates`;
  const specificPostUrl = isAgency
    ? "/api/company/availability/dates"
    : `/api/tours/${slug}/unavailable-dates`;
  const specificDeleteUrl = (id: number) =>
    isAgency
      ? `/api/company/availability/dates/${id}`
      : `/api/tours/${slug}/unavailable-dates/${id}`;
  const recurringPostUrl = isAgency
    ? "/api/company/availability/recurring"
    : `/api/tours/${slug}/recurring-unavailabilities`;
  const recurringDeleteUrl = (id: number) =>
    isAgency
      ? `/api/company/availability/recurring/${id}`
      : `/api/tours/${slug}/recurring-unavailabilities/${id}`;

  const [newDate, setNewDate] = useState("");
  const [newDateReason, setNewDateReason] = useState("");
  const [newRecurringDay, setNewRecurringDay] = useState<number | null>(null);
  const [newRecurringReason, setNewRecurringReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await apiClient.get(fetchUrl);
      return data as {
        specific: UnavailableDate[];
        recurring: RecurringUnavailability[];
      };
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const addDate = useMutation({
    mutationFn: async () => {
      await apiClient.post(specificPostUrl, {
        date: newDate,
        reason: newDateReason || null,
      });
    },
    onSuccess: () => {
      setNewDate("");
      setNewDateReason("");
      invalidate();
      toast.success("Date blocked");
    },
    onError: () => toast.error("Failed to block date"),
  });

  const deleteDate = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(specificDeleteUrl(id));
    },
    onSuccess: () => {
      invalidate();
      toast.success("Date unblocked");
    },
    onError: () => toast.error("Failed to unblock date"),
  });

  const addRecurring = useMutation({
    mutationFn: async () => {
      await apiClient.post(recurringPostUrl, {
        day_of_week: newRecurringDay,
        reason: newRecurringReason || null,
      });
    },
    onSuccess: () => {
      setNewRecurringDay(null);
      setNewRecurringReason("");
      invalidate();
      toast.success("Recurring block added");
    },
    onError: (err: any) => {
      if (err.response?.status === 409)
        toast.error("This day is already blocked");
      else toast.error("Failed to add recurring block");
    },
  });

  const deleteRecurring = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(recurringDeleteUrl(id));
    },
    onSuccess: () => {
      invalidate();
      toast.success("Recurring block removed");
    },
    onError: () => toast.error("Failed to remove"),
  });

  const blockedDays = new Set(data?.recurring.map((r) => r.day_of_week) ?? []);

  if (isLoading)
    return <div className="text-sm text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Block Specific Dates</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Block individual dates — public holidays, special events, maintenance
          days.
        </p>

        <div className="flex gap-2 flex-wrap">
          <div className="space-y-1">
            <Label className="text-xs">Date</Label>
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="h-8 text-sm w-44"
              min={format(new Date(), "yyyy-MM-dd")}
            />
          </div>
          <div className="space-y-1 flex-1 min-w-32">
            <Label className="text-xs">Reason (optional)</Label>
            <Input
              value={newDateReason}
              onChange={(e) => setNewDateReason(e.target.value)}
              placeholder="e.g. Public holiday"
              className="h-8 text-sm"
            />
          </div>
          <div className="flex items-end">
            <Button
              size="sm"
              onClick={() => addDate.mutate()}
              disabled={!newDate || addDate.isPending}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Block Date
            </Button>
          </div>
        </div>

        {data?.specific.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No dates blocked.
          </p>
        ) : (
          <div className="space-y-2">
            {data?.specific.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between gap-2 p-2.5 bg-muted/40 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {format(new Date(d.unavailable_date), "EEE, MMM d, yyyy")}
                  </span>
                  {d.reason && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {d.reason}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                  onClick={() => deleteDate.mutate(d.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Recurring Unavailability</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Block entire days of the week — e.g. never runs on Sundays.
        </p>

        <div className="flex flex-wrap gap-2">
          {DAYS.map((day, i) => {
            const isBlocked = blockedDays.has(i);
            const record = data?.recurring.find((r) => r.day_of_week === i);
            return (
              <button
                key={day}
                onClick={() => {
                  if (isBlocked && record) {
                    deleteRecurring.mutate(record.id);
                  } else {
                    setNewRecurringDay(i);
                  }
                }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  isBlocked
                    ? "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {day.slice(0, 3)}
                {isBlocked && " ✕"}
              </button>
            );
          })}
        </div>

        {newRecurringDay !== null && (
          <div className="flex gap-2 items-end p-3 bg-muted/40 rounded-lg">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">
                Blocking {DAYS[newRecurringDay]} — reason (optional)
              </Label>
              <Input
                value={newRecurringReason}
                onChange={(e) => setNewRecurringReason(e.target.value)}
                placeholder="e.g. Weekly rest day"
                className="h-8 text-sm"
                autoFocus
              />
            </div>
            <Button
              size="sm"
              onClick={() => addRecurring.mutate()}
              disabled={addRecurring.isPending}
            >
              Confirm
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setNewRecurringDay(null);
                setNewRecurringReason("");
              }}
            >
              Cancel
            </Button>
          </div>
        )}

        {data?.recurring.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No recurring blocks.
          </p>
        ) : (
          <div className="space-y-2">
            {data?.recurring.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-2 p-2.5 bg-muted/40 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {DAYS[r.day_of_week]}s
                  </span>
                  {r.reason && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {r.reason}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                  onClick={() => deleteRecurring.mutate(r.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
