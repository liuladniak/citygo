import { useState } from "react";
import axios from "@/lib/apiClient";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  bookingId: number;
  bookingReference: string | null;
  onSuccess: () => void;
}

export default function ConfirmBookingDialog({
  open,
  onClose,
  bookingId,
  bookingReference,
  onSuccess,
}: Props) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsConfirming(true);
    setError(null);
    try {
      await axios.patch(`/api/bookings/${bookingId}`, {
        status: "confirmed",
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to confirm booking");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Confirm Booking</DialogTitle>
        </DialogHeader>

        <div className="flex items-start gap-3 py-2">
          <div className="p-2 rounded-full bg-green-100 shrink-0">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Confirm {bookingReference ?? "this booking"}?
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This will mark the booking as confirmed and notify any assigned
              staff.
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter className="flex flex-col gap-2">
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isConfirming && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Yes, Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
