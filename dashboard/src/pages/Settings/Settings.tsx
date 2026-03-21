import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { useEmployee } from "@/hooks/useEmployee";
import { useRole } from "@/hooks/useRole";
import { useTheme } from "@/components/providers/theme-provider";
import { supabase } from "@/lib/supabaseClient";
import {
  Bell,
  Building2,
  Calendar,
  Loader2,
  Monitor,
  Moon,
  Sun,
  Upload,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import AvailabilityManager from "@/components/AvailabilityManager";

const TIMEZONES = [
  "Europe/Istanbul",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Rome",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const CURRENCIES = ["EUR", "USD", "GBP", "TRY", "AED", "JPY"];

export default function SettingsPage() {
  const { employee, refetch: refetchEmployee } = useEmployee();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { role, loading: roleLoading } = useRole(user?.id);
  const isManager = role === "admin" || role === "manager";
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [pendingLogoUrl, setPendingLogoUrl] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    position: "",
  });

  const [company, setCompany] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    website: "",
    timezone: "",
    currency: "",
    vat_number: "",
    invoice_footer: "",
  });

  const [notifs, setNotifs] = useState({
    notif_new_booking: true,
    notif_cancellation: true,
    notif_daily_schedule: false,
    notif_unassigned_tours: true,
  });

  useEffect(() => {
    if (employee) {
      setProfile({
        first_name: employee.first_name ?? "",
        last_name: employee.last_name ?? "",
        phone: employee.phone ?? "",
        position: employee.position ?? "",
      });
      setNotifs({
        notif_new_booking: employee.notif_new_booking ?? true,
        notif_cancellation: employee.notif_cancellation ?? true,
        notif_daily_schedule: employee.notif_daily_schedule ?? false,
        notif_unassigned_tours: employee.notif_unassigned_tours ?? true,
      });
    }
  }, [employee]);

  const { data: companyData, refetch: refetchCompany } = useQuery({
    queryKey: ["company-settings"],
    queryFn: async () => {
      const { data } = await axios.get(`/api/company/settings`);
      return data;
    },
  });

  useEffect(() => {
    if (companyData) {
      setCompany({
        name: companyData.name ?? "",
        email: companyData.email ?? "",
        phone: companyData.phone ?? "",
        address: companyData.address ?? "",
        city: companyData.city ?? "",
        country: companyData.country ?? "",
        website: companyData.website ?? "",
        timezone: companyData.timezone ?? "Europe/Istanbul",
        currency: companyData.currency ?? "EUR",
        vat_number: companyData.vat_number ?? "",
        invoice_footer: companyData.invoice_footer ?? "",
      });
    }
  }, [companyData]);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);

  const handleSaveProfile = async () => {
    if (!employee?.id) return;
    setIsSavingProfile(true);
    try {
      await axios.patch(`/api/employees/${employee.id}`, profile);
      await refetchEmployee();
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveCompany = async () => {
    setIsSavingCompany(true);
    try {
      await axios.patch(`/api/company/settings`, {
        ...company,
        ...(pendingLogoUrl && { logo_url: pendingLogoUrl }),
      });
      await refetchCompany();
      setPendingLogoUrl(null);
      toast.success("Company settings saved");
    } catch {
      toast.error("Failed to save company settings");
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleSaveNotifs = async () => {
    if (!employee?.id) return;
    setIsSavingNotifs(true);
    try {
      await axios.patch(`/api/employees/${employee.id}`, notifs);
      toast.success("Notification preferences saved");
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setIsSavingNotifs(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !employee?.id) return;
    setIsUploadingPhoto(true);
    try {
      const ext = file.name.split(".").pop();
      const filename = `employee-${employee.id}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("employee-images")
        .upload(filename, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage
        .from("employee-images")
        .getPublicUrl(filename);

      await axios.patch(`/api/employees/${employee.id}`, {
        profile_image: data.publicUrl,
      });
      await refetchEmployee();
      toast.success("Photo updated");
    } catch {
      toast.error("Photo upload failed");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop();
      const filename = `logos/company-logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("tour-images")
        .upload(filename, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage
        .from("tour-images")
        .getPublicUrl(filename);
      setPendingLogoUrl(data.publicUrl);
    } catch (err) {
      console.error("Logo upload failed:", err);
      toast.error("Logo upload failed");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  if (roleLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your profile, company and preferences
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-3.5 w-3.5" /> Profile
          </TabsTrigger>
          {isManager && (
            <TabsTrigger value="company" className="gap-2">
              <Building2 className="h-3.5 w-3.5" /> Company
            </TabsTrigger>
          )}
          {isManager && (
            <TabsTrigger value="availability" className="gap-2">
              <Calendar className="h-3.5 w-3.5" /> Availability
            </TabsTrigger>
          )}
          <TabsTrigger value="appearance" className="gap-2">
            <Sun className="h-3.5 w-3.5" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-3.5 w-3.5" /> Notifications
          </TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="space-y-6 pt-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {employee?.profile_image ? (
                <img
                  src={employee.profile_image}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary border-2 border-border">
                  {employee?.first_name?.charAt(0) ?? "?"}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Profile Photo</p>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="photo-upload"
                  className="cursor-pointer inline-flex items-center gap-2 text-xs border border-border rounded-md px-3 py-1.5 hover:bg-muted transition-colors"
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  Upload Photo
                </Label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                {employee?.profile_image && (
                  <button
                    onClick={async () => {
                      try {
                        await axios.patch(`/api/employees/${employee.id}`, {
                          profile_image: null,
                        });
                        await refetchEmployee();
                        toast.success("Photo removed");
                      } catch {
                        toast.error("Failed to remove photo");
                      }
                    }}
                    className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                  >
                    Remove photo
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">JPG, PNG or WebP</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled className="bg-muted/40" />
            <p className="text-xs text-muted-foreground">
              Managed by Google — cannot be changed here
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>First Name</Label>
              <Input
                value={profile.first_name}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, first_name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Last Name</Label>
              <Input
                value={profile.last_name}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, last_name: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input
              value={profile.phone}
              onChange={(e) =>
                setProfile((p) => ({ ...p, phone: e.target.value }))
              }
              placeholder="+90 555 000 0000"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Position</Label>
            <Input value={profile.position} disabled className="bg-muted/40" />
            <p className="text-xs text-muted-foreground">
              Position is managed by your admin
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
              {isSavingProfile && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Save Profile
            </Button>
          </div>
        </TabsContent>

        {/* COMPANY TAB */}

        {isManager && (
          <TabsContent value="company" className="space-y-6 pt-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg border-2 border-border bg-muted/40 flex items-center justify-center overflow-hidden">
                {pendingLogoUrl || companyData?.logo_url ? (
                  <img
                    src={pendingLogoUrl ?? companyData.logo_url}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Company Logo</p>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="logo-upload"
                    className="cursor-pointer inline-flex items-center gap-2 text-xs border border-border rounded-md px-3 py-1.5 hover:bg-muted transition-colors"
                  >
                    {isUploadingLogo ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    Upload Logo
                  </Label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  {(pendingLogoUrl || companyData?.logo_url) && (
                    <button
                      onClick={() => {
                        setPendingLogoUrl(null);
                        setCompany((p) => ({ ...p }));
                        axios
                          .patch(`/api/company/settings`, {
                            logo_url: null,
                          })
                          .then(() => refetchCompany())
                          .then(() => toast.success("Logo removed"));
                      }}
                      className="text-xs text-destructive hover:underline"
                    >
                      Remove logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Agency Name</Label>
                <Input
                  value={company.name}
                  onChange={(e) =>
                    setCompany((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  value={company.email}
                  type="email"
                  onChange={(e) =>
                    setCompany((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="hello@citygo.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={company.phone}
                  onChange={(e) =>
                    setCompany((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="+90 212 000 0000"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Website</Label>
                <Input
                  value={company.website}
                  onChange={(e) =>
                    setCompany((p) => ({ ...p, website: e.target.value }))
                  }
                  placeholder="https://citygo.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label>VAT Number</Label>
                <Input
                  value={company.vat_number}
                  onChange={(e) =>
                    setCompany((p) => ({ ...p, vat_number: e.target.value }))
                  }
                  placeholder="TR1234567890"
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Address</Label>
                <Input
                  value={company.address}
                  onChange={(e) =>
                    setCompany((p) => ({ ...p, address: e.target.value }))
                  }
                  placeholder="Street address"
                />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input
                  value={company.city}
                  onChange={(e) =>
                    setCompany((p) => ({ ...p, city: e.target.value }))
                  }
                  placeholder="Istanbul"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input
                  value={company.country}
                  onChange={(e) =>
                    setCompany((p) => ({ ...p, country: e.target.value }))
                  }
                  placeholder="Turkey"
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Timezone</Label>
                <Select
                  value={company.timezone}
                  onValueChange={(v) =>
                    setCompany((p) => ({ ...p, timezone: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select
                  value={company.currency}
                  onValueChange={(v) =>
                    setCompany((p) => ({ ...p, currency: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Invoice Footer</Label>
              <Textarea
                value={company.invoice_footer}
                onChange={(e) =>
                  setCompany((p) => ({ ...p, invoice_footer: e.target.value }))
                }
                placeholder="e.g. Thank you for booking with CityGo Tours. VAT registered in Turkey."
                className="resize-none min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground">
                Appears at the bottom of invoices and booking confirmations
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveCompany} disabled={isSavingCompany}>
                {isSavingCompany && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Save Company Settings
              </Button>
            </div>
          </TabsContent>
        )}

        {isManager && (
          <TabsContent value="availability" className="space-y-6 pt-4">
            <div>
              <p className="text-sm font-medium">Agency Availability</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Block dates across all tours — public holidays, agency closures,
                events.
              </p>
            </div>
            <AvailabilityManager />
          </TabsContent>
        )}

        {/* APPEARANCE TAB */}
        <TabsContent value="appearance" className="space-y-4 pt-4">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose how the dashboard looks
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
              { value: "system", label: "System", icon: Monitor },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value as any)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                  theme === value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30 hover:bg-muted/40"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    theme === value ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    theme === value ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
                {theme === value && (
                  <span className="text-[10px] text-primary">Active</span>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Theme preference is saved locally in your browser.
          </p>
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications" className="space-y-6 pt-4">
          <div>
            <p className="text-sm font-medium">Email Notifications</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose which events trigger an email to you. Emails will be sent
              to <span className="font-medium">{user?.email}</span>
            </p>
          </div>

          <Separator />

          {[
            {
              key: "notif_new_booking",
              label: "New Booking",
              description: "Get notified when a new booking is created",
            },
            {
              key: "notif_cancellation",
              label: "Cancellation",
              description: "Get notified when a booking is cancelled",
            },
            {
              key: "notif_daily_schedule",
              label: "Daily Schedule",
              description:
                "Receive a daily summary of today's tours each morning",
            },
            {
              key: "notif_unassigned_tours",
              label: "Unassigned Tours",
              description: "Get notified when a tour has no guide assigned",
            },
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Switch
                checked={notifs[key as keyof typeof notifs]}
                onCheckedChange={(v) => setNotifs((p) => ({ ...p, [key]: v }))}
              />
            </div>
          ))}

          <Separator />

          <p className="text-xs text-muted-foreground">
            Note: Email delivery requires Resend integration to be configured.
            Preferences are saved regardless.
          </p>

          <div className="flex justify-end">
            <Button onClick={handleSaveNotifs} disabled={isSavingNotifs}>
              {isSavingNotifs && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Save Preferences
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
