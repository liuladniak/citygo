import { useEffect, useState } from "react";
import axios from "@/lib/apiClient";
import { Camera, Loader2, Plus, X } from "lucide-react";
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
import { supabase } from "@/lib/supabaseClient";

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

const EMPLOYMENT_TYPES = ["full_time", "part_time", "freelance"];

interface Props {
  open: boolean;
  onClose: () => void;
  employee: any;
  onSuccess: () => void;
}

export default function EditEmployeeModal({
  open,
  onClose,
  employee,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newLanguage, setNewLanguage] = useState("");
  const [newLicence, setNewLicence] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !employee) return;
    setError(null);
    setForm({
      first_name: employee.first_name ?? "",
      last_name: employee.last_name ?? "",
      position: employee.position ?? "",
      employment_type: employee.employment_type ?? "",
      email: employee.email ?? "",
      work_email: employee.work_email ?? "",
      phone: employee.phone ?? "",
      shift_start: employee.shift_start?.slice(0, 5) ?? "",
      shift_end: employee.shift_end?.slice(0, 5) ?? "",
      contract_start: employee.contract_start
        ? new Date(employee.contract_start).toISOString().split("T")[0]
        : "",
      languages: employee.languages ?? [],
      licences: employee.licences ?? [],
      skills: employee.skills ?? [],
      emergency_contact_name: employee.emergency_contact_name ?? "",
      emergency_contact_phone: employee.emergency_contact_phone ?? "",
      emergency_contact_relation: employee.emergency_contact_relation ?? "",
      notes: employee.notes ?? "",
    });
    setPhotoPreview(null);
  }, [open, employee]);

  const colors = [
    "bg-violet-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-cyan-500",
    "bg-amber-500",
    "bg-rose-500",
  ];

  const colorIndex = employee
    ? (employee.first_name.charCodeAt(0) + employee.last_name.charCodeAt(0)) %
      colors.length
    : 0;
  const bgColor = colors[colorIndex];

  const set = (key: string, value: any) =>
    setForm((p: any) => ({ ...p, [key]: value }));

  const addTag = (
    field: string,
    value: string,
    setter: (v: string) => void
  ) => {
    if (!value.trim()) return;
    if (!form[field].includes(value.trim())) {
      set(field, [...form[field], value.trim()]);
    }
    setter("");
  };

  const removeTag = (field: string, value: string) =>
    set(
      field,
      form[field].filter((v: string) => v !== value)
    );

  const handleSave = async () => {
    if (!form.first_name || !form.last_name) {
      setError("First and last name are required");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await axios.patch(`/api/employees/${employee.id}`, {
        ...form,
        shift_start: form.shift_start || null,
        shift_end: form.shift_end || null,
        contract_start: form.contract_start || null,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoPreview(URL.createObjectURL(file));
    setIsUploadingPhoto(true);

    try {
      const ext = file.name.split(".").pop();
      const path = `${employee.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("employee-images")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("employee-images")
        .getPublicUrl(path);

      set("profile_image", data.publicUrl);
    } catch (err) {
      console.error("Photo upload failed:", err);
      setError("Photo upload failed. Changes will still save without it.");
      setPhotoPreview(null);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const FIELD_POSITIONS = ["Lead Guide", "Assistant Guide", "Driver"];
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
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Personal Info
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                {photoPreview || form.profile_image ? (
                  <img
                    src={photoPreview ?? form.profile_image}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-16 h-16 rounded-full ${bgColor} text-white flex items-center justify-center text-lg font-semibold`}
                  >
                    {form.first_name?.[0]}
                    {form.last_name?.[0]}
                  </div>
                )}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div>
                <Label
                  htmlFor="photo-upload"
                  className="cursor-pointer inline-flex items-center gap-2 text-sm border border-border rounded-md px-3 py-1.5 hover:bg-muted transition-colors"
                >
                  <Camera className="h-3.5 w-3.5" />
                  {form.profile_image ? "Change Photo" : "Upload Photo"}
                </Label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG up to 5MB
                </p>
              </div>
            </div>
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
                <Label>Position</Label>
                <Select
                  value={form.position}
                  onValueChange={(v) => set("position", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.replace("_", " ")}
                      </SelectItem>
                    ))}
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
            {!isFieldStaff && (
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

            <div className="space-y-1.5">
              <Label>Languages</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add language..."
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    addTag("languages", newLanguage, setNewLanguage)
                  }
                  className="h-8 text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    addTag("languages", newLanguage, setNewLanguage)
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {form.languages?.map((l: string) => (
                  <Badge key={l} variant="outline" className="text-xs gap-1">
                    {l}
                    <button onClick={() => removeTag("languages", l)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Licences</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add licence..."
                  value={newLicence}
                  onChange={(e) => setNewLicence(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    addTag("licences", newLicence, setNewLicence)
                  }
                  className="h-8 text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addTag("licences", newLicence, setNewLicence)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {form.licences?.map((l: string) => (
                  <Badge key={l} variant="outline" className="text-xs gap-1">
                    {l}
                    <button onClick={() => removeTag("licences", l)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && addTag("skills", newSkill, setNewSkill)
                  }
                  className="h-8 text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addTag("skills", newSkill, setNewSkill)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {form.skills?.map((s: string) => (
                  <Badge key={s} variant="outline" className="text-xs gap-1">
                    {s}
                    <button onClick={() => removeTag("skills", s)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
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
              placeholder="Internal notes about this employee..."
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
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
