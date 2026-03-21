import { useState } from "react";
import axios from "@/lib/apiClient";
import { Link, Navigate, useNavigate } from "react-router-dom";
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
  start_time: string;
  end_time: string;
}
interface ItineraryPoint {
  order: number;
  name: string;
  latitude: string;
  longitude: string;
}

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AddTour() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role } = useRole(user?.id);
  const { employee } = useEmployee();

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [form, setForm] = useState({
    tour_name: "",
    price: "",
    duration: "",
    activity_level: "",
    category: "",
    landmarks: "",
    overview_title: "",
    overview: "",
    highlights: [] as string[],
    includes: "",
    essentials: "",
    additional_costs: "",
    groups: "",
    minimum_of_attendees: "",
    accessibility: [] as string[],
    best_seller: false,
    featured: false,
    images: [] as string[],
    time_slots: [] as TimeSlot[],
    itinerary: [] as ItineraryPoint[],
    status: "draft",
  });

  if (role && role !== "admin" && role !== "manager") {
    return <Navigate to="/tours" replace />;
  }

  const set = (key: string, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setIsUploadingImage(true);
    try {
      const newUrls: string[] = [];
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
        newUrls.push(data.publicUrl);
      }
      set("images", [...form.images, ...newUrls]);
      toast.success(
        `${newUrls.length} image${newUrls.length > 1 ? "s" : ""} uploaded`
      );
    } catch {
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

  const handleSubmit = async () => {
    if (!form.tour_name) {
      toast.error("Tour name is required");
      return;
    }
    if (!form.price) {
      toast.error("Price is required");
      return;
    }
    if (!form.duration) {
      toast.error("Duration is required");
      return;
    }
    if (!form.category) {
      toast.error("Category is required");
      return;
    }

    setIsSaving(true);
    try {
      const { data } = await axios.post(`/api/tours`, {
        ...form,
        groups: Number(form.groups) || 0,
        minimum_of_attendees: Number(form.minimum_of_attendees) || 0,
        actor_id: employee?.id ?? null,
      });
      toast.success("Tour created successfully");
      navigate(`/tours/${data.tour.slug}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to create tour");
    } finally {
      setIsSaving(false);
    }
  };

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
            <Link to="/tours">
              <ChevronLeft className="h-4 w-4" /> Tours
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Add New Tour</h1>
            {form.tour_name && (
              <p className="text-xs text-muted-foreground">
                Slug: {generateSlug(form.tour_name)}
              </p>
            )}
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Create Tour
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Tour Name *</Label>
              <Input
                value={form.tour_name}
                onChange={(e) => set("tour_name", e.target.value)}
                placeholder="e.g. Historical Istanbul Walking Tour"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Price (€) per adult *</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="e.g. 60"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Duration *</Label>
              <Input
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
                placeholder="e.g. 4 hr"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => set("category", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
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
                  <SelectValue placeholder="Select level..." />
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
                  <SelectValue placeholder="Select area..." />
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
                placeholder="e.g. 15"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Min Group Size</Label>
              <Input
                type="number"
                value={form.minimum_of_attendees}
                onChange={(e) => set("minimum_of_attendees", e.target.value)}
                placeholder="e.g. 2"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label>Overview Title</Label>
            <Input
              value={form.overview_title}
              onChange={(e) => set("overview_title", e.target.value)}
              placeholder="e.g. A Journey Through Time"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Overview</Label>
            <Textarea
              value={form.overview}
              onChange={(e) => set("overview", e.target.value)}
              placeholder="Describe the tour experience..."
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
        </TabsContent>

        <TabsContent value="media" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Tour Images</p>
              <p className="text-xs text-muted-foreground">
                First image is the main image.
              </p>
            </div>
            <Label
              htmlFor="add-image-upload"
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
              id="add-image-upload"
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
                      >
                        ←
                      </button>
                    )}
                    <button
                      onClick={() =>
                        set(
                          "images",
                          form.images.filter((_, j) => j !== i)
                        )
                      }
                      className="bg-red-500/80 hover:bg-red-500 text-white rounded p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {i < form.images.length - 1 && (
                      <button
                        onClick={() => moveImage(i, i + 1)}
                        className="bg-white/20 hover:bg-white/40 text-white rounded p-1 text-xs"
                      >
                        →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label>Highlights</Label>
            <div className="space-y-2">
              {form.highlights.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={h}
                    placeholder={`Highlight ${i + 1}`}
                    onChange={(e) => {
                      const arr = [...form.highlights];
                      arr[i] = e.target.value;
                      set("highlights", arr);
                    }}
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
              placeholder="Comma-separated e.g. Entry fees, Guided tour, Water"
              className="resize-none min-h-[80px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label>What to Bring (Essentials)</Label>
            <Textarea
              value={form.essentials}
              onChange={(e) => set("essentials", e.target.value)}
              placeholder="Comma-separated e.g. Comfortable shoes, Sunscreen"
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
                    onClick={() =>
                      set(
                        "accessibility",
                        selected
                          ? form.accessibility.filter((a) => a !== option)
                          : [...form.accessibility, option]
                      )
                    }
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
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4 pt-4">
          <div>
            <p className="text-sm font-medium">Time Slots</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add available departure times.
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
                    value={slot.start_time}
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
                    value={slot.end_time}
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
        </TabsContent>

        <TabsContent value="itinerary" className="space-y-4 pt-4">
          <ItineraryEditor
            itinerary={form.itinerary}
            onChange={(updated) => set("itinerary", updated)}
          />
        </TabsContent>
      </Tabs>
      <p className="text-xs text-muted-foreground text-left">
        You can manage availability after creating the tour from the Edit Tour
        page.
      </p>
      <div className="flex justify-end pt-4 border-t border-border">
        <Button onClick={handleSubmit} disabled={isSaving} size="lg">
          {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Create Tour
        </Button>
      </div>
    </div>
  );
}
