import { useState, useEffect } from "react";
import axios from "@/lib/apiClient";
import { Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DetailedBooking } from "@/types/booking";


function Counter({
  label,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  value: number;
  min?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          –
        </Button>
        <span className="w-6 text-center text-sm font-medium">{value}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onChange(value + 1)}
        >
          +
        </Button>
      </div>
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  booking: DetailedBooking;
  onSuccess: () => void;
}

export default function EditGuestsModal({
  open,
  onClose,
  booking,
  onSuccess,
}: Props) {
  const [form, setForm] = useState({
    adults: booking.guest_distribution?.adults ?? 1,
    children: booking.guest_distribution?.children ?? 0,
    infants: booking.guest_distribution?.infants ?? 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tourPrice, setTourPrice] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;

    setForm({
      adults: booking.guest_distribution?.adults ?? 1,
      children: booking.guest_distribution?.children ?? 0,
      infants: booking.guest_distribution?.infants ?? 0,
    });
    setError(null);
    setTourPrice(null);

    if (booking.is_custom_tour || !booking.tour_id) return;
    axios
      .get(`/api/tours/simple`)
      .then((res) => {
        const tours = res.data.data ?? res.data;
        const tour = tours.find(
          (t: any) => String(t.id) === String(booking.tour_id)
        );
        if (tour) setTourPrice(parseFloat(tour.price));
      })
      .catch(() => {});
  }, [open]);

  const pricePerAdult = tourPrice ?? 0;
  const pricePerChild = pricePerAdult * 0.5;
  const newTotal = booking.is_custom_tour
    ? Number(booking.total_price)
    : form.adults * pricePerAdult + form.children * pricePerChild;

  const oldTotal = Number(booking.total_price);
  const priceDiff = newTotal - oldTotal;

  const hasGuestChanges =
    form.adults !== (booking.guest_distribution?.adults ?? 1) ||
    form.children !== (booking.guest_distribution?.children ?? 0) ||
    form.infants !== (booking.guest_distribution?.infants ?? 0);

  const hasPriceChange =
    !booking.is_custom_tour &&
    tourPrice !== null &&
    Math.abs(priceDiff) > 0.001;

  const saveGuests = async (recordPayment: boolean) => {
    setError(null);
    try {
      await axios.patch(`/api/bookings/${booking.id}/guests`, {
        adults: form.adults,
        children: form.children,
        infants: form.infants,
      });

      if (recordPayment && hasPriceChange) {
        await axios.post(`/api/bookings/${booking.id}/payments`, {
          method: priceDiff < 0 ? "refund" : "cash",
          amount: priceDiff,
          paid_at: new Date().toISOString(),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to save");
    }
  };

  const handleSaveLater = async () => {
    setIsSaving(true);
    await saveGuests(false);
    setIsSaving(false);
  };

  const handleSaveAndRecord = async () => {
    setIsRecordingPayment(true);
    await saveGuests(true);
    setIsRecordingPayment(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-fit min-w-[360px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Party Size</DialogTitle>
        </DialogHeader>

        <div className="py-1">
          <Counter
            label="Adults"
            value={form.adults}
            min={1}
            onChange={(v) => setForm((p) => ({ ...p, adults: v }))}
          />
          <Counter
            label="Children (2–14)"
            value={form.children}
            onChange={(v) => setForm((p) => ({ ...p, children: v }))}
          />
          <Counter
            label="Infants (0–2)"
            value={form.infants}
            onChange={(v) => setForm((p) => ({ ...p, infants: v }))}
          />
        </div>

        {hasGuestChanges && hasPriceChange && (
          <div
            className={`rounded-lg p-3 flex items-start gap-2 text-sm ${
              priceDiff > 0
                ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                : "bg-blue-50 text-blue-800 border border-blue-200"
            }`}
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">
                {priceDiff > 0 ? "Additional payment required" : "Refund owed"}
              </p>
              <p className="text-xs mt-0.5">
                Total changes from €{oldTotal.toFixed(2)} to €
                {newTotal.toFixed(2)} ({priceDiff > 0 ? "+" : ""}€
                {priceDiff.toFixed(2)})
              </p>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter className="flex flex-col gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="sm:mr-auto">
            Cancel
          </Button>
          {hasGuestChanges && hasPriceChange ? (
            <>
              <Button
                variant="outline"
                onClick={handleSaveLater}
                disabled={isSaving || isRecordingPayment}
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save — remind me later
              </Button>
              <Button
                onClick={handleSaveAndRecord}
                disabled={isSaving || isRecordingPayment}
              >
                {isRecordingPayment && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {priceDiff > 0
                  ? "Save & record payment"
                  : "Save & record refund"}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleSaveLater}
              disabled={isSaving || !hasGuestChanges}
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
