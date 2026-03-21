import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/apiClient";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Search,
  Mail,
  Phone,
  Calendar,
  Euro,
  Users,
  Globe,
  BookOpen,
  X,
  TrendingUp,
} from "lucide-react";

const languageNames: Record<string, string> = {
  en: "English",
  fr: "French",
  de: "German",
  es: "Spanish",
  it: "Italian",
  tr: "Turkish",
  ru: "Russian",
  zh: "Chinese",
  ar: "Arabic",
  ja: "Japanese",
  pt: "Portuguese",
  nl: "Dutch",
};

const sourceLabels: Record<string, string> = {
  admin_dashboard: "Direct",
  website: "Website",
  referral: "Referral",
};

interface Guest {
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  total_bookings: string;
  cancelled_bookings: string;
  total_spend: string | null;
  last_booking_date: string;
  first_booking_date: string;
  sources: string[];
  languages: string[];
}

function GuestRow({ guest, onClick }: { guest: Guest; onClick: () => void }) {
  const totalBookings = parseInt(guest.total_bookings);
  const cancelledBookings = parseInt(guest.cancelled_bookings);
  const activeBookings = totalBookings - cancelledBookings;
  const isRepeat = activeBookings > 1;
  const totalSpend = guest.total_spend ? parseFloat(guest.total_spend) : 0;

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-3 hover:bg-muted/40 cursor-pointer transition-colors border-b border-border last:border-0"
    >
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
        {guest.primary_contact_name.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">
            {guest.primary_contact_name}
          </p>
          {isRepeat && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 shrink-0"
            >
              Repeat
            </Badge>
          )}
          {cancelledBookings === totalBookings && totalBookings > 0 && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 bg-red-50 text-red-600 border-red-200 shrink-0"
            >
              All cancelled
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {guest.primary_contact_email}
        </p>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground w-24 shrink-0">
        <BookOpen className="h-3.5 w-3.5" />
        <span>
          {activeBookings} booking{activeBookings !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="hidden md:flex items-center gap-1.5 text-xs w-24 shrink-0">
        <Euro className="h-3.5 w-3.5 text-muted-foreground" />
        <span
          className={totalSpend > 0 ? "font-medium" : "text-muted-foreground"}
        >
          {totalSpend > 0 ? `€${totalSpend.toLocaleString()}` : "—"}
        </span>
      </div>

      <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground w-24 shrink-0">
        <Globe className="h-3.5 w-3.5" />
        <span>
          {guest.languages
            ?.filter(Boolean)
            .map((l) => languageNames[l] ?? l)
            .join(", ") || "—"}
        </span>
      </div>

      <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground w-32 shrink-0">
        <Calendar className="h-3.5 w-3.5" />
        <span>{format(new Date(guest.last_booking_date), "MMM d, yyyy")}</span>
      </div>
    </div>
  );
}

function GuestPanel({ guest }: { guest: Guest; onClose: () => void }) {
  const totalBookings = parseInt(guest.total_bookings);
  const cancelledBookings = parseInt(guest.cancelled_bookings);
  const activeBookings = totalBookings - cancelledBookings;
  const totalSpend = guest.total_spend ? parseFloat(guest.total_spend) : 0;
  const cancellationRate =
    totalBookings > 0
      ? Math.round((cancelledBookings / totalBookings) * 100)
      : 0;

  const { data: bookingHistory } = useQuery({
    queryKey: ["guest-bookings", guest.primary_contact_email],
    queryFn: async () => {
      const { data } = await axios.get(`/api/bookings/all`, {
        params: {
          search: guest.primary_contact_email,
          limit: 50,
        },
      });
      return data.data ?? [];
    },
    enabled: !!guest.primary_contact_email,
  });

  return (
    <SheetContent className="w-full sm:w-[480px] overflow-y-auto p-0">
      <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
            {guest.primary_contact_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <SheetTitle className="text-base">
              {guest.primary_contact_name}
            </SheetTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customer since{" "}
              {format(new Date(guest.first_booking_date), "MMM yyyy")}
            </p>
          </div>
        </div>
      </SheetHeader>

      <div className="px-6 py-5 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-lg font-bold">{activeBookings}</p>
            <p className="text-xs text-muted-foreground">Bookings</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-emerald-500">
              €{totalSpend > 0 ? totalSpend.toLocaleString() : "0"}
            </p>
            <p className="text-xs text-muted-foreground">Total Spend</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p
              className={`text-lg font-bold ${
                cancellationRate > 30 ? "text-destructive" : ""
              }`}
            >
              {cancellationRate}%
            </p>
            <p className="text-xs text-muted-foreground">Cancel Rate</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contact
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <a
              href={`mailto:${guest.primary_contact_email}`}
              className="text-primary hover:underline truncate"
            >
              {guest.primary_contact_email}
            </a>
          </div>
          {guest.primary_contact_phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <a
                href={`tel:${guest.primary_contact_phone}`}
                className="hover:underline"
              >
                {guest.primary_contact_phone}
              </a>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Details
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span>
              {guest.languages
                ?.filter(Boolean)
                .map((l) => languageNames[l] ?? l)
                .join(", ") || "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span>
              {guest.sources
                ?.filter(Boolean)
                .map((s) => sourceLabels[s] ?? s)
                .join(", ") || "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span>
              Last booking:{" "}
              {format(new Date(guest.last_booking_date), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Booking History
          </p>
          {!bookingHistory ? (
            <p className="text-xs text-muted-foreground">Loading...</p>
          ) : bookingHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground">No bookings found</p>
          ) : (
            <div className="space-y-2">
              {bookingHistory
                .filter(
                  (b: any) =>
                    b.primary_contact_email === guest.primary_contact_email
                )
                .map((b: any) => (
                  <div
                    key={b.id}
                    className="flex items-start justify-between gap-2 p-2.5 bg-muted/40 rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">
                        {b.tour_name ?? "Custom Tour"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(b.tour_date), "MMM d, yyyy")}
                        {b.total_guests && ` · ${b.total_guests} guests`}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {b.booking_reference}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 h-4 ${
                          b.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : b.status === "cancelled"
                            ? "bg-red-50 text-red-600 border-red-200"
                            : b.status === "pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {b.status}
                      </Badge>
                      {b.total_price && (
                        <span className="text-xs font-medium">
                          €{parseFloat(b.total_price).toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </SheetContent>
  );
}

export default function Guests() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const limit = 20;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading } = useQuery({
    queryKey: ["guests", debouncedSearch, page],
    queryFn: async () => {
      const { data } = await axios.get(`/api/bookings/guests`, {
        params: {
          search: debouncedSearch || undefined,
          page,
          limit,
        },
      });
      return data;
    },
  });

  const guests: Guest[] = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Guests</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} guests in total
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-2 bg-muted/30 border-b border-border">
          <div className="w-9 shrink-0" />
          <div className="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Guest
          </div>
          <div className="hidden sm:block text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24 shrink-0">
            Bookings
          </div>
          <div className="hidden md:block text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24 shrink-0">
            Spend
          </div>
          <div className="hidden lg:block text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24 shrink-0">
            Language
          </div>
          <div className="hidden lg:block text-xs font-semibold text-muted-foreground uppercase tracking-wider w-32 shrink-0">
            Last Booking
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            Loading guests...
          </div>
        ) : guests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Users className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm font-medium">No guests found</p>
            {search && <p className="text-xs mt-1">Try a different search</p>}
          </div>
        ) : (
          guests.map((guest) => (
            <GuestRow
              key={guest.primary_contact_email}
              guest={guest}
              onClick={() => setSelectedGuest(guest)}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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

      <Sheet
        open={!!selectedGuest}
        onOpenChange={(o) => {
          if (!o) setSelectedGuest(null);
        }}
      >
        {selectedGuest && (
          <GuestPanel
            guest={selectedGuest}
            onClose={() => setSelectedGuest(null)}
          />
        )}
      </Sheet>
    </div>
  );
}
