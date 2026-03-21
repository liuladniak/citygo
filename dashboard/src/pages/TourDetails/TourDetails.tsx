import { useState, useEffect } from "react";
import axios from "@/lib/apiClient";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Clock,
  Users,
  Zap,
  Star,
  ChevronLeft,
  Edit,
  MapPin,
  CheckCircle,
  Info,
  AlertCircle,
  Footprints,
  DollarSign,
  Calendar,
  ArrowRight,
} from "lucide-react";


const categoryConfig: Record<string, { class: string }> = {
  "Guided tour": {
    class:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400",
  },
  "Culinary tour": {
    class:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400",
  },
  "Cultural tour": {
    class:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
  },
  Experience: {
    class:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
  },
};

const activityConfig: Record<string, { color: string }> = {
  Easy: { color: "text-emerald-500" },
  Moderate: { color: "text-amber-500" },
  Hard: { color: "text-red-500" },
};

interface Tour {
  id: number;
  tour_name: string;
  slug: string;
  duration: string;
  category: string;
  price: string;
  activity_level: string;
  overview_title: string;
  overview: string;
  essentials: string;
  includes: string;
  accessibility: string;
  additional_costs: string;
  groups: number;
  minimum_of_attendees: number;
  best_seller: boolean;
  featured: boolean;
  images: string[];
  highlights: string[];
  tour_time_slots: { id: number; start_time: string; end_time: string }[];
  tour_itinerary_coordinates: {
    id: number;
    order: number;
    latitude: string;
    longitude: string;
    name: string;
  }[];
}

export default function TourDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role } = useRole(user?.id);
  const [tour, setTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  const isManager = role === "admin" || role === "manager";

  useEffect(() => {
    axios
      .get(`/api/tours/${slug}`)
      .then((res) => {
        setTour(res.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground text-sm">
          Loading...
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="font-medium">Tour not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/tours")}
        >
          Back to Tours
        </Button>
      </div>
    );
  }

  const catConfig = categoryConfig[tour.category] ?? { class: "" };
  const actConfig = activityConfig[tour.activity_level] ?? {
    color: "text-muted-foreground",
  };

  const accessibilityItems = Array.isArray(tour.accessibility)
    ? tour.accessibility
    : typeof tour.accessibility === "string"
    ? tour.accessibility
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const includesItems = tour.includes
    ? tour.includes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const essentialsItems = tour.essentials
    ? tour.essentials
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/tours")}
            className="gap-1 text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Tours
          </Button>
        </div>
        {isManager && (
          <Button asChild>
            <Link to={`/tours/${slug}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Tour
            </Link>
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-muted">
          {tour.images?.[activeImage] ? (
            <img
              src={tour.images[activeImage]}
              alt={tour.tour_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            {tour.best_seller && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-400 text-amber-900 px-2.5 py-1 rounded-full">
                <Star className="h-3 w-3 fill-amber-900" /> Bestseller
              </span>
            )}
            {tour.featured && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-500 text-white px-2.5 py-1 rounded-full">
                <Zap className="h-3 w-3" /> Featured
              </span>
            )}
          </div>
        </div>

        {tour.images?.length > 1 && (
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-1">
              {tour.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === activeImage
                      ? "border-primary"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {tour.tour_name}
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <Badge variant="outline" className={`${catConfig.class}`}>
                {tour.category}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> {tour.duration}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5" /> Max {tour.groups} · Min{" "}
                {tour.minimum_of_attendees}
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${actConfig.color}`}
              >
                <Footprints className="h-3.5 w-3.5" /> {tour.activity_level}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">
              €{parseFloat(tour.price).toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">per person</p>
          </div>
        </div>
      </div>

      <Separator />

      {tour.tour_time_slots?.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Available Time Slots
          </h2>
          <div className="flex flex-wrap gap-2">
            {tour.tour_time_slots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center gap-1.5 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm"
              >
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
              </div>
            ))}
          </div>
        </section>
      )}

      <Separator />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {tour.overview_title || "Overview"}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {tour.overview}
        </p>
      </section>

      {tour.highlights?.length > 0 && (
        <>
          <Separator />
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Highlights
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tour.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <Separator />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {includesItems.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" /> What's
              Included
            </h2>
            <ul className="space-y-1.5">
              {includesItems.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {essentialsItems.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" /> What to Bring
            </h2>
            <ul className="space-y-1.5">
              {essentialsItems.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <ArrowRight className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {tour.additional_costs && (
        <>
          <Separator />
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-amber-500" /> Additional Costs
            </h2>
            <p className="text-sm text-muted-foreground">
              {tour.additional_costs}
            </p>
          </section>
        </>
      )}

      {accessibilityItems.length > 0 && (
        <>
          <Separator />
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Accessibility
            </h2>
            <div className="flex flex-wrap gap-2">
              {accessibilityItems.map((item, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-xs font-normal"
                >
                  {item}
                </Badge>
              ))}
            </div>
          </section>
        </>
      )}

      {tour.tour_itinerary_coordinates?.length > 0 && (
        <>
          <Separator />
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Itinerary
            </h2>
            <div className="relative">
              <div className="absolute left-3.5 top-4 bottom-4 w-px bg-border" />
              <ul className="space-y-4">
                {tour.tour_itinerary_coordinates
                  .sort((a, b) => a.order - b.order)
                  .map((point, i) => (
                    <li
                      key={point.id}
                      className="relative flex items-start gap-4 pl-12"
                    >
                      <div className="absolute left-0 w-7 h-7 rounded-full bg-card border-2 border-border flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{point.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {parseFloat(point.latitude).toFixed(4)},{" "}
                          {parseFloat(point.longitude).toFixed(4)}
                        </p>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
