import { useState } from "react";
import axios from "@/lib/apiClient";
import { Loader2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

const POSITIONS = [
  "Lead Guide",
  "Assistant Guide",
  "Driver",
  "Tour Manager",
  "Operations Manager",
  "Sales Representative",
  "Finance",
  "Admin",
];

const FIELD_POSITIONS = ["Lead Guide", "Assistant Guide", "Driver"];

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEmployeeModal({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    position: "",
    employment_type: "",
    email: "",
    work_email: "",
    phone: "",
    shift_start: "",
    shift_end: "",
    contract_start: "",
    languages: [] as string[],
    licences: [] as string[],
    skills: [] as string[],
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
    notes: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newLanguage, setNewLanguage] = useState("");
  const [newLicence, setNewLicence] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const set = (key: string, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const addTag = (
    field: keyof typeof form,
    value: string,
    setter: (v: string) => void
  ) => {
    if (!value.trim()) return;
    const arr = form[field] as string[];
    if (!arr.includes(value.trim())) set(field, [...arr, value.trim()]);
    setter("");
  };

  const removeTag = (field: keyof typeof form, value: string) =>
    set(
      field,
      (form[field] as string[]).filter((v) => v !== value)
    );

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.position) {
      setError("First name, last name and position are required");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await axios.post(`/api/employees`, {
        ...form,
        shift_start: form.shift_start || null,
        shift_end: form.shift_end || null,
        contract_start: form.contract_start || null,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to create employee");
    } finally {
      setIsSaving(false);
    }
  };

  const isFieldStaff = FIELD_POSITIONS.includes(form.position);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Personal Info
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>First Name *</Label>
                <Input
                  value={form.first_name}
                  onChange={(e) => set("first_name", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name *</Label>
                <Input
                  value={form.last_name}
                  onChange={(e) => set("last_name", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Employment
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Position *</Label>
                <Select
                  value={form.position}
                  onValueChange={(v) => set("position", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position..." />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Employment Type</Label>
                <Select
                  value={form.employment_type}
                  onValueChange={(v) => set("employment_type", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Contract Start</Label>
                <input
                  type="date"
                  value={form.contract_start}
                  onChange={(e) => set("contract_start", e.target.value)}
                  className="w-full h-10 px-3 border border-border rounded-md bg-background text-sm"
                />
              </div>
            </div>
            {!isFieldStaff && form.position && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Shift Start</Label>
                  <input
                    type="time"
                    value={form.shift_start}
                    onChange={(e) => set("shift_start", e.target.value)}
                    className="w-full h-10 px-3 border border-border rounded-md bg-background text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Shift End</Label>
                  <input
                    type="time"
                    value={form.shift_end}
                    onChange={(e) => set("shift_end", e.target.value)}
                    className="w-full h-10 px-3 border border-border rounded-md bg-background text-sm"
                  />
                </div>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contact
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Personal Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Work Email</Label>
                <Input
                  value={form.work_email}
                  onChange={(e) => set("work_email", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Skills & Qualifications
            </h3>
            {[
              {
                label: "Languages",
                field: "languages" as const,
                value: newLanguage,
                setter: setNewLanguage,
                placeholder: "e.g. English",
              },
              {
                label: "Licences",
                field: "licences" as const,
                value: newLicence,
                setter: setNewLicence,
                placeholder: "e.g. Tour Guide Licence",
              },
              {
                label: "Skills",
                field: "skills" as const,
                value: newSkill,
                setter: setNewSkill,
                placeholder: "e.g. Public Speaking",
              },
            ].map(({ label, field, value, setter, placeholder }) => (
              <div key={field} className="space-y-1.5">
                <Label>{label}</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && addTag(field, value, setter)
                    }
                    className="h-8 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addTag(field, value, setter)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(form[field] as string[]).map((v) => (
                    <Badge key={v} variant="outline" className="text-xs gap-1">
                      {v}
                      <button onClick={() => removeTag(field, v)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Emergency Contact
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={form.emergency_contact_name}
                  onChange={(e) =>
                    set("emergency_contact_name", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Relation</Label>
                <Input
                  value={form.emergency_contact_relation}
                  onChange={(e) =>
                    set("emergency_contact_relation", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={form.emergency_contact_phone}
                  onChange={(e) =>
                    set("emergency_contact_phone", e.target.value)
                  }
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notes
            </h3>
            <Textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Internal notes..."
              className="resize-none min-h-[80px]"
            />
          </section>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter className="flex flex-col gap-2">
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Add Employee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
