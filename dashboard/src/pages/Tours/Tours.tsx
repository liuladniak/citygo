import { useState, useEffect } from "react";
import axios from "@/lib/apiClient";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Search,
  Plus,
  Star,
  Zap,
  Users,
  ChevronRight,
  Loader2,
} from "lucide-react";

const categoryConfig: Record<string, { class: string }> = {
  "Guided tour": {
    class:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800",
  },
  "Culinary tour": {
    class:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800",
  },
  "Cultural tour": {
    class:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  },
  "Adventure tour": {
    class:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
  },
};

interface Tour {
  id: number;
  tour_name: string;
  slug: string;
  duration: string;
  price: string;
  category: string;
  activity_level: string;
  best_seller: boolean;
  featured: boolean;
  groups: number;
  images: string[];
  status: string;
}

function TourCard({ tour }: { tour: Tour }) {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  const statusConfig: Record<string, { label: string; class: string }> = {
    active: {
      label: "Active",
      class:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
    },
    draft: {
      label: "Draft",
      class:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
    },
    inactive: {
      label: "Inactive",
      class:
        "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400",
    },
    archived: {
      label: "Archived",
      class:
        "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400",
    },
  };

  const catConfig = categoryConfig[tour.category] ?? {
    class: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const imageUrl = tour.images?.[0] ?? null;
  return (
    <Link
      to={`/tours/${tour.slug}`}
      className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-200 flex flex-col"
    >
      <div className="relative h-44 bg-muted overflow-hidden">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={tour.tour_name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Users className="h-8 w-8 opacity-20" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {tour.best_seller && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full">
              <Star className="h-2.5 w-2.5 fill-amber-900" />
              Bestseller
            </span>
          )}
          {tour.featured && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-500 text-white px-2 py-0.5 rounded-full">
              <Zap className="h-2.5 w-2.5" />
              Featured
            </span>
          )}
          {tour.status && tour.status !== "active" && (
            <Badge
              variant="outline"
              className={`text-[10px] px-2 py-0 h-5 ${
                statusConfig[tour.status]?.class
              }`}
            >
              {statusConfig[tour.status]?.label}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {tour.tour_name}
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={`text-[10px] px-2 py-0 h-5 ${catConfig.class}`}
          >
            {tour.category}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {tour.duration}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            Max {tour.groups}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
          <div>
            <span className="text-base font-bold text-foreground">
              €{parseFloat(tour.price).toFixed(0)}
            </span>
            <span className="text-xs text-muted-foreground ml-1">/ person</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/tours/${tour.slug}/edit`);
            }}
          >
            Edit
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Link>
  );
}

export default function Tours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 12;
  const [statusFilter, setStatusFilter] = useState("active");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category]);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, any> = { page, limit };

        if (debouncedSearch) params.search = debouncedSearch;
        if (category !== "all") params.category = category;
        if (statusFilter !== "all") params.status = statusFilter;
        const { data } = await axios.get(`/api/tours`, { params });
        setTours(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [page, debouncedSearch, category, statusFilter]);

  const categories = [
    "all",
    "Guided tour",
    "Culinary tour",
    "Cultural tour",
    "Adventure tour",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tours</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} tours available
          </p>
        </div>
        <Button asChild>
          <Link to="/tours/add">
            <Plus className="h-4 w-4 mr-2" />
            Add Tour
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tours..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 w-56"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.slice(1).map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        {(search || category !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-muted-foreground"
            onClick={() => {
              setSearch("");
              setCategory("all");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : tours.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No tours found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
