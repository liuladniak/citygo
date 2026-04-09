import { useEffect, useState } from "react";
import axios from "@/lib/apiClient";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatTime } from "@/lib/utils";
import apiClient from "@/lib/apiClient";
import { AvailabilityCalendar } from "../AvailabilityCalendar";

export default function EditDetailsModal({
  open,
  onClose,
  booking,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  booking: any;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    tour_date: booking.tour_date?.split("T")[0] ?? "",
    time_slot_id: booking.time_slot_id ? String(booking.time_slot_id) : "",
    start_time: booking.start_time ?? "",
    end_time: booking.end_time ?? "",
    meeting_point: booking.meeting_point ?? "",
    notes: booking.notes ?? "",
  });
  const [timeSlots, setTimeSlots] = useState<
    { id: number; tour_id: number; start_time: string; end_time: string }[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tourSlug, setTourSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!open || booking.is_custom_tour || !booking.tour_id) return;

    apiClient.get(`/api/tours/simple`).then((res) => {
      const tours = res.data.data ?? res.data;
      const tour = tours.find(
        (t: any) => String(t.id) === String(booking.tour_id)
      );
      if (tour) setTourSlug(tour.slug);
    });

    axios
      .get(`/api/tours/time-slots`)
      .then((res) => {
        const all = res.data.data ?? res.data;
        setTimeSlots(
          all.filter((s: any) => String(s.tour_id) === String(booking.tour_id))
        );
      })
      .catch(() => {});
  }, [open]);

  const handleSubmit = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const changes: Record<string, any> = {};
      if (form.tour_date !== booking.tour_date?.split("T")[0])
        changes.tour_date = form.tour_date;
      if (
        !booking.is_custom_tour &&
        form.time_slot_id !== String(booking.time_slot_id)
      )
        changes.time_slot_id = parseInt(form.time_slot_id);
      if (
        booking.is_custom_tour &&
        form.start_time !== (booking.start_time ?? "")
      )
        changes.start_time = form.start_time || null;
      if (booking.is_custom_tour && form.end_time !== (booking.end_time ?? ""))
        changes.end_time = form.end_time || null;
      if (form.meeting_point !== (booking.meeting_point ?? ""))
        changes.meeting_point = form.meeting_point || null;
      if (form.notes !== (booking.notes ?? ""))
        changes.notes = form.notes || null;

      if (Object.keys(changes).length === 0) {
        onClose();
        return;
      }

      await axios.patch(`/api/bookings/${booking.id}`, changes);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Experience Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="space-y-2">
            <Label>Date</Label>

            <AvailabilityCalendar
              slug={tourSlug}
              selected={
                form.tour_date
                  ? new Date(form.tour_date + "T12:00:00")
                  : undefined
              }
              onSelect={(date) => {
                if (!date) return;
                setForm((p) => ({
                  ...p,
                  tour_date: date.toISOString().split("T")[0],
                }));
              }}
            />
            {form.tour_date && (
              <p className="text-xs text-muted-foreground">
                Selected:{" "}
                {new Date(form.tour_date + "T12:00:00").toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </p>
            )}
          </div>

          {!booking.is_custom_tour && timeSlots.length > 0 && (
            <div className="space-y-1.5">
              <Label>Time Slot</Label>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, time_slot_id: String(slot.id) }))
                    }
                    className={`rounded-lg border px-4 py-3 text-sm text-left transition-all ${
                      form.time_slot_id === String(slot.id)
                        ? "border-primary bg-primary/5 font-medium"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {booking.is_custom_tour && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start Time</Label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, start_time: e.target.value }))
                  }
                  className="w-full h-10 px-3 border border-border rounded-md bg-background text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label>End Time</Label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, end_time: e.target.value }))
                  }
                  className="w-full h-10 px-3 border border-border rounded-md bg-background text-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Meeting Point</Label>
            <Input
              placeholder="e.g. Sultanahmet Square, main entrance"
              value={form.meeting_point}
              onChange={(e) =>
                setForm((p) => ({ ...p, meeting_point: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((p) => ({ ...p, notes: e.target.value }))
              }
              placeholder="Special requests, dietary requirements..."
              className="w-full min-h-[80px] px-3 py-2 border border-border rounded-md bg-background text-sm resize-none"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
