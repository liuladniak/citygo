import { useEffect, useState } from "react";
import axios from "@/lib/apiClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, UserPlus, Loader2 } from "lucide-react";

interface Guide {
  id: number;
  full_name: string;
  position: string;
  booking_count: number;
  is_available: boolean;
}

interface Assignment {
  id: number;
  guide_id: number;
  guide_name: string;
  role: string;
}

interface AssignGuideModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: number;
  bookingDate: string;
  bookingReference: string | null;
}

const ROLES = [
  { value: "lead_guide", label: "Lead Guide" },
  { value: "assistant_guide", label: "Assistant Guide" },
  { value: "driver", label: "Driver" },
];

const roleStyles: Record<string, string> = {
  lead_guide: "bg-blue-100 text-blue-700",
  assistant_guide: "bg-purple-100 text-purple-700",
  driver: "bg-orange-100 text-orange-700",
};

export function AssignGuideModal({
  open,
  onClose,
  bookingId,
  bookingDate,
  bookingReference,
}: AssignGuideModalProps) {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [guidesRes, assignmentsRes] = await Promise.all([
          axios
            .get(`/api/employees/available`, {
              params: { date: bookingDate },
            })
            .catch((err) => {
              console.error("guides failed:", err.response?.data);
              throw err;
            }),
          axios
            .get(`/api/bookings/${bookingId}/assignments`)
            .catch((err) => {
              console.error("assignments failed:", err.response?.data);
              throw err;
            }),
        ]);
        setGuides(guidesRes.data.data);
        setAssignments(assignmentsRes.data.data);
      } catch (err: any) {
        console.error("Failed to load guide data:", err.response?.data);
        setError("Failed to load guide data");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [open, bookingId, bookingDate]);

  const handleAssign = async () => {
    if (!selectedGuide || !selectedRole) return;
    setIsSaving(true);
    setError(null);
    try {
      const res = await axios.post(
        `/api/bookings/${bookingId}/assignments`,
        { guide_id: parseInt(selectedGuide), role: selectedRole }
      );
      const newAssignment = res.data.data;
      const guide = guides.find((g) => g.id === parseInt(selectedGuide));
      setAssignments((prev) => [
        ...prev,
        { ...newAssignment, guide_name: guide?.full_name ?? "" },
      ]);
      setSelectedGuide("");
      setSelectedRole("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to assign guide");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (assignmentId: number) => {
    try {
      await axios.delete(
        `/api/bookings/${bookingId}/assignments/${assignmentId}`
      );
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    } catch {
      setError("Failed to remove assignment");
    }
  };

  const availableGuides = guides.filter(
    (g) => !assignments.some((a) => a.guide_id === g.id)
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            Assign Guides — {bookingReference ?? "No Reference"}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col gap-6 pt-2">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Current Assignments</p>
              {assignments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No guides assigned yet.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {assignments.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {a.guide_name}
                        </span>
                        <Badge
                          className={`text-xs ${
                            roleStyles[a.role] ?? "bg-gray-100 text-gray-700"
                          }`}
                          variant="secondary"
                        >
                          {ROLES.find((r) => r.value === a.role)?.label ??
                            a.role}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(a.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">Add Guide</p>

              <Select value={selectedGuide} onValueChange={setSelectedGuide}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a guide..." />
                </SelectTrigger>
                <SelectContent>
                  {availableGuides.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>
                      <div className="flex items-center justify-between gap-4 w-full">
                        <span>{g.full_name}</span>
                        <span
                          className={`text-xs ${
                            g.is_available
                              ? "text-emerald-600"
                              : "text-orange-500"
                          }`}
                        >
                          {g.booking_count} booking
                          {g.booking_count !== 1 ? "s" : ""} today
                          {!g.is_available ? " · busy" : ""}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {error && <p className="text-xs text-destructive">{error}</p>}

              <Button
                onClick={handleAssign}
                disabled={!selectedGuide || !selectedRole || isSaving}
                className="w-full"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                Assign Guide
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
