import { useEffect, useState } from "react";
import axios from "@/lib/apiClient";
import { AlertTriangle, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CANCELLATION_REASONS = [
  { value: "customer_request", label: "Customer Request" },
  { value: "no_show", label: "No Show" },
  { value: "weather", label: "Weather Conditions" },
  { value: "operational", label: "Operational Issue" },
  { value: "duplicate", label: "Duplicate Booking" },
  { value: "other", label: "Other" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  bookingId: number;
  bookingReference: string | null;
  bookingDate: string;
  amountPaid: number;
  onSuccess: () => void;
}

export default function CancelBookingDialog({
  open,
  onClose,
  bookingId,
  bookingReference,
  bookingDate,
  amountPaid,
  onSuccess,
}: Props) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [refundType, setRefundType] = useState<"full" | "partial" | "none">(
    "full"
  );
  const [partialAmount, setPartialAmount] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tourDate = new Date(bookingDate);
  const now = new Date();
  const hoursUntilTour =
    (tourDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isLateCancellation = hoursUntilTour < 24 && hoursUntilTour > 0;

  const hasPayment = amountPaid > 0;

  const refundAmount =
    refundType === "full"
      ? amountPaid
      : refundType === "partial"
      ? parseFloat(partialAmount) || 0
      : 0;

  useEffect(() => {
    if (open) {
      setReason("");
      setNotes("");
      setRefundType("full");
      setPartialAmount("");
      setError(null);
    }
  }, [open]);

  const handleCancel = async () => {
    if (!reason) {
      setError("Please select a cancellation reason.");
      return;
    }
    setIsCancelling(true);
    setError(null);
    try {
      await axios.post(`/api/bookings/${bookingId}/cancel`, {
        reason,
        notes: notes || null,
        refund_amount: hasPayment ? refundAmount : 0,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-fit min-w-[420px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cancel Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Cancel {bookingReference ?? "this booking"}?
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                This action cannot be undone. The booking will be marked as
                cancelled.
              </p>
            </div>
          </div>

          {isLateCancellation && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Late cancellation policy applies
                </p>
                <p className="text-xs text-yellow-700 mt-0.5">
                  This tour is less than 24 hours away. Your cancellation policy
                  may apply.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Cancellation Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {CANCELLATION_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>
              Notes{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              placeholder="Any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none min-h-[80px]"
            />
          </div>

          {hasPayment && (
            <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
              <div>
                <p className="text-sm font-medium">Refund</p>
                <p className="text-xs text-muted-foreground">
                  €{amountPaid.toFixed(2)} was paid for this booking
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  {
                    value: "full",
                    label: `Full refund — €${amountPaid.toFixed(2)}`,
                  },
                  { value: "partial", label: "Partial refund" },
                  { value: "none", label: "No refund" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2.5 text-sm cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="refund"
                      value={option.value}
                      checked={refundType === option.value}
                      onChange={() =>
                        setRefundType(option.value as typeof refundType)
                      }
                      className="accent-primary"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              {refundType === "partial" && (
                <div className="space-y-1.5">
                  <Label>Refund Amount (€)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={amountPaid}
                    placeholder="0.00"
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter className="flex flex-col gap-2">
          <Button variant="outline" onClick={onClose} className="w-full">
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isCancelling}
            className="w-full"
          >
            {isCancelling && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {hasPayment && refundAmount > 0
              ? `Cancel & Refund €${refundAmount.toFixed(2)}`
              : "Cancel Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
