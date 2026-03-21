import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REASONS = [
  { value: "resigned", label: "Resigned" },
  { value: "terminated", label: "Terminated" },
  { value: "contract_ended", label: "Contract Ended" },
  { value: "seasonal", label: "End of Season" },
  { value: "other", label: "Other" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  employee: any;
  onSuccess: () => void;
}

export default function DeactivateEmployeeModal({
  open,
  onClose,
  employee,
  onSuccess,
}: Props) {
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeactivate = async () => {
    if (!reason) {
      setError("Please select a reason");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await axios.patch(`/api/employees/${employee.id}/deactivate`, {
        reason: REASONS.find((r) => r.value === reason)?.label,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to deactivate employee");
    } finally {
      setIsSaving(false);
    }
  };

  if (!employee) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Deactivate Employee
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            You are about to deactivate{" "}
            <span className="font-medium text-foreground">
              {employee.first_name} {employee.last_name}
            </span>
            . They will be removed from the active team and will no longer
            appear in scheduling. Their history will be preserved.
          </p>

          <div className="space-y-1.5">
            <Label>Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="flex flex-col gap-2">
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeactivate}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Deactivate Employee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
