import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PaymentModal({
  open,
  onClose,
  bookingId,
  balance,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  bookingId: number;
  balance: number;
  onSuccess: () => void;
}) {
  const [method, setMethod] = useState("cash");
  const [amount, setAmount] = useState(String(balance));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return setError("Enter a valid amount");
    setIsSaving(true);
    setError(null);
    try {
      await axios.post(`/api/bookings/${bookingId}/payments`, {
        method,
        status: "paid",
        amount: parsed,
        paid_at: new Date().toISOString(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Payment failed");
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
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="space-y-1.5">
            <Label>Payment Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="credit_card">Credit / Debit Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Amount (€)</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Balance due: €{balance.toFixed(2)}
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
