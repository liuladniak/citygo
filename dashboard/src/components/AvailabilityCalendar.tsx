import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useTourAvailability } from "@/hooks/useTourAvailability";

interface Props {
  slug?: string | null;
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
}

export function AvailabilityCalendar({ slug, selected, onSelect }: Props) {
  const { data: availability } = useTourAvailability(slug ?? null);
  const [pendingDate, setPendingDate] = useState<Date | null>(null);

  const isBlocked = (date: Date): boolean => {
    if (!availability) return false;
    const dayOfWeek = date.getDay();
    const formatted = date.toISOString().split("T")[0];
    return (
      availability.recurring.some((r) => r.day_of_week === dayOfWeek) ||
      availability.specific.some(
        (s) => s.unavailable_date?.split("T")[0] === formatted
      )
    );
  };

  const getBlockReason = (date: Date): string | null => {
    if (!availability) return null;
    const dayOfWeek = date.getDay();
    const formatted = date.toISOString().split("T")[0];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const recurring = availability.recurring.find(
      (r) => r.day_of_week === dayOfWeek
    );
    if (recurring) return recurring.reason ?? `Closed on ${days[dayOfWeek]}s`;
    const specific = availability.specific.find(
      (s) => s.unavailable_date?.split("T")[0] === formatted
    );
    if (specific) return specific.reason ?? "Marked unavailable";
    return null;
  };

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    if (isBlocked(date)) {
      setPendingDate(date);
    } else {
      setPendingDate(null);
      onSelect(date);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-3">
      <Calendar
        mode="single"
        selected={selected}
        onSelect={handleSelect}
        disabled={(date) => date < today}
        modifiers={{ blocked: (date) => isBlocked(date) }}
        modifiersStyles={{
          blocked: {
            color: "#f59e0b",
            textDecoration: "line-through",
            opacity: 0.7,
          },
        }}
        className="p-0 [--cell-size:2.25rem]"
      />

      {slug &&
        availability &&
        (availability.recurring.length > 0 ||
          availability.specific.length > 0) && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Unavailable — click to override</span>
            </div>
          </div>
        )}

      {pendingDate && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-amber-500">⚠️</span>
            <div>
              <p className="text-sm font-medium text-amber-700">
                {pendingDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}{" "}
                is unavailable
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                {getBlockReason(pendingDate)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onSelect(pendingDate);
                setPendingDate(null);
              }}
              className="text-xs px-3 py-1.5 rounded-md bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors font-medium"
            >
              Override — book anyway
            </button>
            <button
              onClick={() => setPendingDate(null)}
              className="text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
