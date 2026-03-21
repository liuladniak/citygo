import { useState, useEffect } from "react";
import axios from "@/lib/apiClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";


interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  createdBy: number | null;
  onSuccess: () => void;
}

export default function CreateTaskModal({
  open,
  onClose,
  createdBy,
  onSuccess,
}: Props) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "normal",
    assigned_to: "",
    due_date: "",
    type: "general",
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      title: "",
      description: "",
      priority: "normal",
      assigned_to: "",
      due_date: "",
      type: "general",
    });
    setError(null);
    axios.get(`/api/employees`).then((res) => {
      setEmployees(res.data.data ?? res.data);
    });
  }, [open]);

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await axios.post(`/api/tasks`, {
        title: form.title,
        description: form.description || null,
        priority: form.priority,
        assigned_to: form.assigned_to || null,
        due_date: form.due_date || null,
        type: form.type,
        created_by: createdBy,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to create task");
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
      <DialogContent className="max-w-fit min-w-[420px]">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              Description{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              placeholder="Add more details..."
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              className="resize-none min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm((p) => ({ ...p, priority: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="tour">Tour Related</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>
              Assign To{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Select
              value={form.assigned_to}
              onValueChange={(v) => setForm((p) => ({ ...p, assigned_to: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a team member..." />
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    {e.first_name} {e.last_name}
                    <span className="text-xs text-muted-foreground ml-1">
                      · {e.position}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>
              Due Date{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) =>
                setForm((p) => ({ ...p, due_date: e.target.value }))
              }
              className="w-full h-10 px-3 border border-border rounded-md bg-background text-sm"
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter className="flex flex-col gap-2">
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
