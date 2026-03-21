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

export default function EditContactModal({
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
    primary_contact_name: booking.primary_contact_name ?? "",
    primary_contact_email: booking.primary_contact_email ?? "",
    primary_contact_phone: booking.primary_contact_phone ?? "",
    language: booking.language ?? "en",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await axios.patch(`/api/bookings/${booking.id}`, form);
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
          <DialogTitle>Edit Contact Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="space-y-1.5">
            <Label>Full Name *</Label>
            <Input
              value={form.primary_contact_name}
              onChange={(e) =>
                setForm((p) => ({ ...p, primary_contact_name: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.primary_contact_email}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  primary_contact_email: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input
              type="tel"
              value={form.primary_contact_phone}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  primary_contact_phone: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Preferred Language</Label>
            <Select
              value={form.language}
              onValueChange={(v) => setForm((p) => ({ ...p, language: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="it">Italian</SelectItem>
                <SelectItem value="tr">Turkish</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
                <SelectItem value="ko">Korean</SelectItem>
              </SelectContent>
            </Select>
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
