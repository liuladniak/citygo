import { useEffect, useState } from "react";
import axios from "@/lib/apiClient";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEmployee } from "@/hooks/useEmployee";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/lib/supabaseClient";
import {
  ChevronLeft,
  Clock,
  Loader2,
  Plus,
  Star,
  Trash2,
  Upload,
  X,
  Zap,
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
import ItineraryEditor from "@/components/itinerary/ItineraryEditor";

const CATEGORIES = [
  "Guided tour",
  "Culinary tour",
  "Cultural tour",
  "Experience",
];
const ACTIVITY_LEVELS = ["Easy", "Moderate", "Hard"];
const LANDMARKS = ["Center", "Neighborhood"];
const ACCESSIBILITY_OPTIONS = [
  "Fully Wheelchair Accessible",
  "Partially accessible",
  "Not Wheelchair Accessible",
  "Audio Guide Available",
  "Sign Language Interpretation Available",
  "Family-Friendly",
  "Pet-Friendly",
  "Elderly-Friendly",
  "Elevator/Lift Access Available",
  "Rest Stops/Seating Available",
];

interface TimeSlot {
  id?: number;
  start_time: string;
  end_time: string;
}
interface ItineraryPoint {
  id?: number;
  order: number;
  name: string;
  latitude: string;
  longitude: string;
}

interface FormData {
  tour_name: string;
  price: string;
  duration: string;
  activity_level: string;
  category: string;
  landmarks: string;
  overview_title: string;
  overview: string;
  highlights: string[];
  includes: string;
  essentials: string;
  additional_costs: string;
  groups: string;
  minimum_of_attendees: string;
  accessibility: string[];
  best_seller: boolean;
  featured: boolean;
  images: string[];
  time_slots: TimeSlot[];
  itinerary: ItineraryPoint[];
  status: string;
}

export default function EditTourPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { role } = useRole(user?.id);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [original, setOriginal] = useState<FormData | null>(null);
  const { employee } = useEmployee();
  const [form, setForm] = useState<FormData>({
    tour_name: "",
    price: "",
    duration: "",
    activity_level: "",
    category: "",
    landmarks: "",
    overview_title: "",
    overview: "",
    highlights: [],
    includes: "",
    essentials: "",
    additional_costs: "",
    groups: "",
    minimum_of_attendees: "",
    accessibility: [],
    best_seller: false,
    featured: false,
    images: [],
    time_slots: [],
    itinerary: [],
    status: "active",
  });

  if (role && role !== "admin" && role !== "manager") {
    return <Navigate to={`/tours/${slug}`} replace />;
  }

  useEffect(() => {
    axios
      .get(`/api/tours/${slug}`)
      .then((res) => {
        const t = res.data;
        const loaded = {
          tour_name: t.tour_name ?? "",
          price: t.price ?? "",
          duration: t.duration ?? "",
          activity_level: t.activity_level ?? "",
          category: t.category ?? "",
          landmarks: t.landmarks ?? "",
          overview_title: t.overview_title ?? "",
          overview: t.overview ?? "",
          highlights: t.highlights ?? [],
          includes: t.includes ?? "",
          essentials: t.essentials ?? "",
          additional_costs: t.additional_costs ?? "",
          groups: String(t.groups ?? ""),
          minimum_of_attendees: String(t.minimum_of_attendees ?? ""),
          accessibility:
            typeof t.accessibility === "string"
              ? t.accessibility
                  .split(",")
                  .map((s: string) => s.trim())
                  .filter(Boolean)
              : t.accessibility ?? [],
          best_seller: t.best_seller ?? false,
          featured: t.featured ?? false,
          images: t.images ?? [],
          time_slots: t.tour_time_slots ?? [],
          itinerary: (t.tour_itinerary_coordinates ?? []).sort(
            (a: ItineraryPoint, b: ItineraryPoint) => a.order - b.order
          ),
          status: t.status ?? "active",
        };
        setForm(loaded);
        setOriginal(loaded);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [slug]);

  const saveOverview = async () => {
    setIsSaving(true);
    try {
      const fields = [
        "tour_name",
        "price",
        "duration",
        "activity_level",
        "category",
        "landmarks",
        "overview_title",
        "overview",
        "groups",
        "minimum_of_attendees",
        "best_seller",
        "featured",
        "status",
      ] as const;
      const payload: Record<string, any> = {};
      for (const f of fields) {
        if (form[f] !== original?.[f]) payload[f] = form[f];
      }
      if (Object.keys(payload).length === 0) {
        toast.info("No changes");
        return;
      }
      await axios.patch(`/api/tours/${slug}`, {
        ...payload,
        actor_id: employee?.id,
      });
      setOriginal((p) => ({ ...p!, ...payload }));
      toast.success("Overview saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const saveMedia = async () => {
    setIsSaving(true);
    try {
      await axios.put(`/api/tours/${slug}/images`, {
        images: form.images,
        actor_id: employee?.id,
      });
      setOriginal((p) => ({ ...p!, images: form.images }));
      toast.success("Images saved");
    } catch {
      toast.error("Failed to save images");
    } finally {
      setIsSaving(false);
    }
  };

  const saveDetails = async () => {
    setIsSaving(true);
    try {
      const payload: Record<string, any> = {};
      if (
        JSON.stringify(form.highlights) !== JSON.stringify(original?.highlights)
      ) {
        await axios.put(`/api/tours/${slug}/highlights`, {
          highlights: form.highlights,
        });
        setOriginal((p) => ({ ...p!, highlights: form.highlights }));
      }
      const detailFields = [
        "includes",
        "essentials",
        "additional_costs",
      ] as const;
      for (const f of detailFields) {
        if (form[f] !== original?.[f]) payload[f] = form[f];
      }
      if (
        JSON.stringify(form.accessibility) !==
        JSON.stringify(original?.accessibility)
      ) {
        payload.accessibility = form.accessibility;
      }
      if (Object.keys(payload).length > 0) {
        await axios.patch(`/api/tours/${slug}`, {
          ...payload,
          actor_id: employee?.id,
        });
        setOriginal((p) => ({ ...p!, ...payload }));
      }
      toast.success("Details saved");
    } catch {
      toast.error("Failed to save details");
    } finally {
      setIsSaving(false);
    }
  };

  const saveSchedule = async () => {
    setIsSaving(true);
    try {
      await axios.put(`/api/tours/${slug}/time-slots`, {
        time_slots: form.time_slots,
        actor_id: employee?.id,
      });
      setOriginal((p) => ({ ...p!, time_slots: form.time_slots }));
      toast.success("Schedule saved");
    } catch {
      toast.error("Failed to save schedule");
    } finally {
      setIsSaving(false);
    }
  };

  const saveItinerary = async () => {
    setIsSaving(true);
    try {
      await axios.put(`/api/tours/${slug}/itinerary`, {
        itinerary: form.itinerary,
        actor_id: employee?.id,
      });
      setOriginal((p) => ({ ...p!, itinerary: form.itinerary }));
      toast.success("Itinerary saved");
    } catch {
      toast.error("Failed to save itinerary");
    } finally {
      setIsSaving(false);
    }
  };

  const set = (key: keyof FormData, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setIsUploadingImage(true);
    try {
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const filename = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;
        const { error } = await supabase.storage
          .from("tour-images")
          .upload(filename, file, { upsert: false });
        if (error) throw error;
        const { data } = supabase.storage
          .from("tour-images")
          .getPublicUrl(filename);
        set("images", [...form.images, data.publicUrl]);
      }
      toast.success("Image uploaded");
    } catch (err) {
      toast.error("Image upload failed");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const moveImage = (from: number, to: number) => {
    const imgs = [...form.images];
    const [moved] = imgs.splice(from, 1);
    imgs.splice(to, 0, moved);
    set("images", imgs);
  };

  const removeImage = (index: number) => {
    set(
      "images",
      form.images.filter((_, i) => i !== index)
    );
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-1 text-muted-foreground"
          >
            <Link to={`/tours/${slug}`}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Edit Tour</h1>
            <p className="text-xs text-muted-foreground">{form.tour_name}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Tour Name *</Label>
              <Input
                value={form.tour_name}
                onChange={(e) => set("tour_name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Price (€) per adult</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Duration</Label>
              <Input
                placeholder="e.g. 4 hr"
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => set("category", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Activity Level</Label>
              <Select
                value={form.activity_level}
                onValueChange={(v) => set("activity_level", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_LEVELS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Landmark Area</Label>
              <Select
                value={form.landmarks}
                onValueChange={(v) => set("landmarks", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANDMARKS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Max Group Size</Label>
              <Input
                type="number"
                value={form.groups}
                onChange={(e) => set("groups", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Min Group Size</Label>
              <Input
                type="number"
                value={form.minimum_of_attendees}
                onChange={(e) => set("minimum_of_attendees", e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label>Overview Title</Label>
            <Input
              value={form.overview_title}
              onChange={(e) => set("overview_title", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Overview</Label>
            <Textarea
              value={form.overview}
              onChange={(e) => set("overview", e.target.value)}
              className="min-h-[140px] resize-none"
            />
          </div>

          <Separator />

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <Switch
                checked={form.best_seller}
                onCheckedChange={(v) => set("best_seller", v)}
              />
              <div>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-amber-500" /> Bestseller
                </p>
                <p className="text-xs text-muted-foreground">
                  Show bestseller badge
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.featured}
                onCheckedChange={(v) => set("featured", v)}
              />
              <div>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-blue-500" /> Featured
                </p>
                <p className="text-xs text-muted-foreground">
                  Show on homepage
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1.5">
              <Label>Tour Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v)}
              >
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    🟢 Active — visible to clients
                  </SelectItem>
                  <SelectItem value="draft">🟡 Draft — under review</SelectItem>
                  <SelectItem value="inactive">
                    ⚪ Inactive — temporarily hidden
                  </SelectItem>
                  <SelectItem value="archived">
                    🔴 Archived — retired
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only Active tours are visible and bookable by clients.
              </p>
            </div>
            <Button onClick={saveOverview} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Overview
            </Button>
          </div>
        </TabsContent>

        {/* MEDIA TAB */}
        <TabsContent value="media" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Tour Images</p>
              <p className="text-xs text-muted-foreground">
                First image is the main image. Drag to reorder.
              </p>
            </div>
            <Label
              htmlFor="image-upload"
              className="cursor-pointer inline-flex items-center gap-2 text-sm border border-border rounded-md px-3 py-1.5 hover:bg-muted transition-colors"
            >
              {isUploadingImage ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              Upload Images
            </Label>
            <input
              id="image-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {form.images.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-xl h-40 flex items-center justify-center text-muted-foreground text-sm">
              No images yet — upload some above
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {form.images.map((img, i) => (
                <div
                  key={img}
                  className="relative group rounded-lg overflow-hidden border border-border aspect-video bg-muted"
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute top-1.5 left-1.5 text-[10px] font-semibold bg-black/60 text-white px-1.5 py-0.5 rounded">
                      Main
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {i > 0 && (
                      <button
                        onClick={() => moveImage(i, i - 1)}
                        className="bg-white/20 hover:bg-white/40 text-white rounded p-1 text-xs"
                        title="Move left"
                      >
                        ←
                      </button>
                    )}
                    <button
                      onClick={() => removeImage(i)}
                      className="bg-red-500/80 hover:bg-red-500 text-white rounded p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {i < form.images.length - 1 && (
                      <button
                        onClick={() => moveImage(i, i + 1)}
                        className="bg-white/20 hover:bg-white/40 text-white rounded p-1 text-xs"
                        title="Move right"
                      >
                        →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end pt-2">
            <Button onClick={saveMedia} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Images
            </Button>
          </div>
        </TabsContent>

        {/* DETAILS TAB */}
        <TabsContent value="details" className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label>Highlights</Label>
            <div className="space-y-2">
              {form.highlights.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={h}
                    onChange={(e) => {
                      const arr = [...form.highlights];
                      arr[i] = e.target.value;
                      set("highlights", arr);
                    }}
                    placeholder={`Highlight ${i + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      set(
                        "highlights",
                        form.highlights.filter((_, j) => j !== i)
                      )
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => set("highlights", [...form.highlights, ""])}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Highlight
            </Button>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label>What's Included</Label>
            <Textarea
              value={form.includes}
              onChange={(e) => set("includes", e.target.value)}
              placeholder="Comma-separated list e.g. Entry fees, Guided tour, Water"
              className="resize-none min-h-[80px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label>What to Bring (Essentials)</Label>
            <Textarea
              value={form.essentials}
              onChange={(e) => set("essentials", e.target.value)}
              placeholder="Comma-separated list e.g. Comfortable shoes, Sunscreen"
              className="resize-none min-h-[80px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Additional Costs</Label>
            <Input
              value={form.additional_costs}
              onChange={(e) => set("additional_costs", e.target.value)}
              placeholder="e.g. Lunch not included"
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Accessibility</Label>
            <div className="flex flex-wrap gap-2">
              {ACCESSIBILITY_OPTIONS.map((option) => {
                const selected = form.accessibility.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => {
                      set(
                        "accessibility",
                        selected
                          ? form.accessibility.filter((a) => a !== option)
                          : [...form.accessibility, option]
                      );
                    }}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={saveDetails} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Details
            </Button>
          </div>
        </TabsContent>

        {/* SCHEDULE TAB */}
        <TabsContent value="schedule" className="space-y-4 pt-4">
          <div>
            <p className="text-sm font-medium">Time Slots</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add the available departure times for this tour.
            </p>
          </div>

          <div className="space-y-2">
            {form.time_slots.map((slot, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg"
              >
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={slot.start_time.slice(0, 5)}
                    onChange={(e) => {
                      const slots = [...form.time_slots];
                      slots[i] = { ...slots[i], start_time: e.target.value };
                      set("time_slots", slots);
                    }}
                    className="h-9 px-2 border border-border rounded-md bg-background text-sm"
                  />
                  <span className="text-muted-foreground text-sm">to</span>
                  <input
                    type="time"
                    value={slot.end_time.slice(0, 5)}
                    onChange={(e) => {
                      const slots = [...form.time_slots];
                      slots[i] = { ...slots[i], end_time: e.target.value };
                      set("time_slots", slots);
                    }}
                    className="h-9 px-2 border border-border rounded-md bg-background text-sm"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() =>
                    set(
                      "time_slots",
                      form.time_slots.filter((_, j) => j !== i)
                    )
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              set("time_slots", [
                ...form.time_slots,
                { start_time: "09:00", end_time: "12:00" },
              ])
            }
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Time Slot
          </Button>
          <div className="flex justify-end pt-2">
            <Button onClick={saveSchedule} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Schedule
            </Button>
          </div>
        </TabsContent>

        {/* ITINERARY TAB */}
        <TabsContent value="itinerary" className="space-y-4 pt-4">
          <ItineraryEditor
            itinerary={form.itinerary}
            onChange={(updated) => set("itinerary", updated)}
          />

          <div className="flex justify-end pt-2">
            <Button onClick={saveItinerary} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Itinerary
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4 pt-4">
          <div>
            <p className="text-sm font-medium">Tour Availability</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Block specific dates or recurring days for this tour only.
            </p>
          </div>
          <AvailabilityManager slug={slug} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
