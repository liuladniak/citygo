import React, { useEffect, useState } from "react";
import axios from "@/lib/apiClient";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserCog,
  UserPlus,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BackButton from "@/components/ui/BackButton";

interface Tour {
  id: number;
  tour_name: string;
  duration: string;
  price: string;
  category: string;
}

interface TimeSlot {
  id: number;
  tour_id: number;
  start_time: string;
  end_time: string;
}

interface Guide {
  id: number;
  full_name: string;
  booking_count: number;
  is_available: boolean;
}

interface Assignment {
  guide_id: number;
  guide_name: string;
  role: string;
}

export type BookingFormState = {
  is_custom_tour: boolean;

  tour_id: string;
  time_slot_id: string;
  tour_date: string;
  start_time: string;
  end_time: string;
  meeting_point: string;

  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  language: string;
  adults: number;
  children: number;
  infants: number;
  guest_names: { id: string; full_name: string }[];

  payment_method: string;
  payment_status: string;
  amount_paid: number;
  total_price: number;
  source: string;
  notes: string;
};

const INITIAL_STATE: BookingFormState = {
  is_custom_tour: false,
  tour_id: "",
  time_slot_id: "",
  tour_date: "",
  start_time: "",
  end_time: "",
  meeting_point: "",
  primary_contact_name: "",
  primary_contact_email: "",
  primary_contact_phone: "",
  language: "en",
  adults: 1,
  children: 0,
  infants: 0,
  guest_names: [],
  payment_method: "cash",
  payment_status: "pending",
  amount_paid: 0,
  total_price: 0,
  source: "admin_dashboard",
  notes: "",
};

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

const STEPS = [
  { id: 1, label: "Type" },
  { id: 2, label: "Tour & Date" },
  { id: 3, label: "Guests" },
  { id: 4, label: "Payment" },
  { id: 5, label: "Guide" },
];

function Step1({
  form,
  setForm,
}: {
  form: BookingFormState;
  setForm: React.Dispatch<React.SetStateAction<BookingFormState>>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Booking Type</h2>
        <p className="text-sm text-muted-foreground">
          Is this a standard tour from our catalogue or a custom private tour?
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setForm((p) => ({ ...p, is_custom_tour: false }))}
          className={`flex flex-col gap-2 rounded-xl border-2 p-6 text-left transition-all ${
            !form.is_custom_tour
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground"
          }`}
        >
          <span className="text-2xl">🗺️</span>
          <span className="font-semibold">Standard Tour</span>
          <span className="text-xs text-muted-foreground">
            Pick from our catalogue of tours with fixed time slots and pricing.
          </span>
        </button>
        <button
          type="button"
          onClick={() => setForm((p) => ({ ...p, is_custom_tour: true }))}
          className={`flex flex-col gap-2 rounded-xl border-2 p-6 text-left transition-all ${
            form.is_custom_tour
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground"
          }`}
        >
          <span className="text-2xl">✨</span>
          <span className="font-semibold">Custom Tour</span>
          <span className="text-xs text-muted-foreground">
            Private or bespoke experience with flexible timing and custom
            pricing.
          </span>
        </button>
      </div>
    </div>
  );
}

function Step2({
  form,
  setForm,
  tours,
  timeSlots,
  isLoadingTours,
}: {
  form: BookingFormState;
  setForm: React.Dispatch<React.SetStateAction<BookingFormState>>;
  tours: Tour[];
  timeSlots: TimeSlot[];
  isLoadingTours: boolean;
}) {
  const selectedTour = tours.find((t) => String(t.id) === form.tour_id);
  const availableSlots = timeSlots.filter(
    (s) => String(s.tour_id) === form.tour_id
  );

  const formatTime = (t: string) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">
          {form.is_custom_tour ? "Custom Tour Details" : "Tour & Date"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {form.is_custom_tour
            ? "Set the date, time and meeting point for the custom tour."
            : "Select a tour, date, and available time slot."}
        </p>
      </div>

      {!form.is_custom_tour && (
        <div className="space-y-2">
          <Label>Select Tour</Label>
          {isLoadingTours ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading tours...
            </div>
          ) : (
            <Select
              value={form.tour_id}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, tour_id: v, time_slot_id: "" }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a tour" />
              </SelectTrigger>
              <SelectContent>
                {tours.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    <div className="flex flex-col">
                      <span>{t.tour_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {t.duration} · €{t.price}pp
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {selectedTour && (
            <p className="text-xs text-muted-foreground">
              {selectedTour.category} · {selectedTour.duration} · €
              {selectedTour.price} per person
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>Tour Date</Label>
        <input
          type="date"
          value={form.tour_date}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) =>
            setForm((p) => ({ ...p, tour_date: e.target.value }))
          }
          className="w-full h-10 px-3 border border-border rounded-md bg-background text-sm"
        />
      </div>

      {!form.is_custom_tour && form.tour_id && availableSlots.length > 0 && (
        <div className="space-y-2">
          <Label>Time Slot</Label>
          <div className="grid grid-cols-2 gap-2">
            {availableSlots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() =>
                  setForm((p) => ({ ...p, time_slot_id: String(slot.id) }))
                }
                className={`rounded-lg border px-4 py-3 text-sm text-left transition-all ${
                  form.time_slot_id === String(slot.id)
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
              </button>
            ))}
          </div>
        </div>
      )}

      {form.is_custom_tour && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) =>
                  setForm((p) => ({ ...p, start_time: e.target.value }))
                }
                className="w-full h-10 px-3 border border-border rounded-md bg-background text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) =>
                  setForm((p) => ({ ...p, end_time: e.target.value }))
                }
                className="w-full h-10 px-3 border border-border rounded-md bg-background text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Meeting Point</Label>
            <Input
              placeholder="e.g. Sultanahmet Square, main entrance"
              value={form.meeting_point}
              onChange={(e) =>
                setForm((p) => ({ ...p, meeting_point: e.target.value }))
              }
            />
          </div>
        </>
      )}
    </div>
  );
}

function Step3({
  form,
  setForm,
}: {
  form: BookingFormState;
  setForm: React.Dispatch<React.SetStateAction<BookingFormState>>;
}) {
  const [showGuestNames, setShowGuestNames] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Guest Details</h2>
        <p className="text-sm text-muted-foreground">
          Primary contact and guest counts.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Primary Contact Name *</Label>
          <Input
            placeholder="Full name"
            value={form.primary_contact_name}
            onChange={(e) =>
              setForm((p) => ({ ...p, primary_contact_name: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="email@example.com"
            value={form.primary_contact_email}
            onChange={(e) =>
              setForm((p) => ({ ...p, primary_contact_email: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input
            type="tel"
            placeholder="+90 123 456 7890"
            value={form.primary_contact_phone}
            onChange={(e) =>
              setForm((p) => ({ ...p, primary_contact_phone: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Preferred Language</Label>
          <Select
            value={form.language}
            onValueChange={(v) => setForm((p) => ({ ...p, language: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="it">Italian</SelectItem>
              <SelectItem value="tr">Turkish</SelectItem>
              <SelectItem value="ja">Japanese</SelectItem>
              <SelectItem value="ko">Korean</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Guest Counts</Label>
        <GuestCounter
          label="Adults"
          value={form.adults}
          min={1}
          onChange={(v) => setForm((p) => ({ ...p, adults: v }))}
        />
        <GuestCounter
          label="Children (2–14)"
          value={form.children}
          onChange={(v) => setForm((p) => ({ ...p, children: v }))}
        />
        <GuestCounter
          label="Infants (0–2)"
          value={form.infants}
          onChange={(v) => setForm((p) => ({ ...p, infants: v }))}
        />
      </div>

      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowGuestNames((p) => !p)}
        >
          {showGuestNames ? "Hide guest names" : "Add guest names (optional)"}
        </Button>

        {showGuestNames && (
          <div className="mt-4 space-y-2">
            {form.guest_names.map((g, i) => (
              <div key={g.id} className="flex gap-2">
                <Input
                  placeholder={`Guest ${i + 1} full name`}
                  value={g.full_name}
                  onChange={(e) => {
                    const updated = [...form.guest_names];
                    updated[i].full_name = e.target.value;
                    setForm((p) => ({ ...p, guest_names: updated }));
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      guest_names: p.guest_names.filter((x) => x.id !== g.id),
                    }))
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  guest_names: [
                    ...p.guest_names,
                    { id: crypto.randomUUID(), full_name: "" },
                  ],
                }))
              }
            >
              + Add guest
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Step4({
  form,
  setForm,
  tours,
}: {
  form: BookingFormState;
  setForm: React.Dispatch<React.SetStateAction<BookingFormState>>;
  tours: Tour[];
}) {
  const selectedTour = tours.find((t) => String(t.id) === form.tour_id);
  const pricePerAdult = selectedTour ? parseFloat(selectedTour.price) : 0;
  const pricePerChild = pricePerAdult * 0.5;
  const calculatedPrice =
    form.adults * pricePerAdult + form.children * pricePerChild;
  const totalPrice = form.is_custom_tour ? form.total_price : calculatedPrice;

  const bookingStatus = form.is_custom_tour ? "draft" : "pending";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Payment Details</h2>
        <p className="text-sm text-muted-foreground">
          Record payment method and amount collected.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
          Booking Status
        </p>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={
              bookingStatus === "draft"
                ? "bg-gray-100 text-gray-700"
                : "bg-yellow-100 text-yellow-700"
            }
          >
            {bookingStatus}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {form.is_custom_tour
              ? "Custom tours start as draft until confirmed"
              : "Standard tours start as pending until payment received"}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Select
            value={form.payment_method}
            onValueChange={(v) => setForm((p) => ({ ...p, payment_method: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="credit_card">Credit / Debit Card</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Booking Source</Label>
          <Select
            value={form.source}
            onValueChange={(v) => setForm((p) => ({ ...p, source: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin_dashboard">Admin Dashboard</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="viator">Viator</SelectItem>
              <SelectItem value="airbnb">Airbnb Experiences</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="walk_in">Walk-in</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {form.is_custom_tour ? (
          <div className="space-y-2">
            <Label>Agreed Total Price (€)</Label>
            <Input
              type="number"
              min={0}
              placeholder="0.00"
              value={form.total_price || ""}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  total_price: parseFloat(e.target.value) || 0,
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Enter the agreed total for this custom tour
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Total Price (€)</Label>
            <div className="h-10 flex items-center rounded-md border bg-muted/30 px-3 text-sm">
              €{calculatedPrice.toFixed(2)}
              <span className="ml-2 text-xs text-muted-foreground">
                ({form.adults} adults × €{pricePerAdult}
                {form.children > 0
                  ? ` + ${form.children} children × €${pricePerChild}`
                  : ""}
                )
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Amount Paid (€)</Label>
          <Input
            type="number"
            min={0}
            max={totalPrice}
            placeholder="0.00"
            value={form.amount_paid || ""}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                amount_paid: parseFloat(e.target.value) || 0,
              }))
            }
          />
          <p className="text-xs text-muted-foreground">
            Leave 0 if payment not yet received
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes & Special Requests</Label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          placeholder="Dietary restrictions, accessibility needs, special requests..."
          className="w-full min-h-[80px] px-3 py-2 border border-border rounded-md bg-background text-sm resize-none"
        />
      </div>
    </div>
  );
}

function Step5({
  assignments,
  setAssignments,
  bookingDate,
}: {
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  bookingDate: string;
}) {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [showAddForm, setShowAddForm] = useState(true);

  useEffect(() => {
    if (!bookingDate) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`/api/employees/available`, {
          params: { date: bookingDate },
        });
        setGuides(res.data.data);
      } catch {
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [bookingDate]);

  const handleRemove = (guideId: number) => {
    setAssignments((p) => p.filter((a) => a.guide_id !== guideId));
  };

  const availableGuides = guides.filter(
    (g) => !assignments.some((a) => a.guide_id === g.id)
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Guide Assignment</h2>
        <p className="text-sm text-muted-foreground">
          Assign guides now or skip — you can assign later from the booking
          detail page.
        </p>
      </div>

      {assignments.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label>Assigned</Label>
          {assignments.map((a) => (
            <div
              key={a.guide_id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <UserCog className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{a.guide_name}</span>
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    roleStyles[a.role] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {ROLES.find((r) => r.value === a.role)?.label ?? a.role}
                </Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemove(a.guide_id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
      {showAddForm ? (
        <div className="flex flex-col gap-3">
          <Label>Assign Staff</Label>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading available
              staff...
            </div>
          ) : (
            <>
              <Select
                value={selectedGuide}
                onValueChange={(guideId) => {
                  setSelectedGuide(guideId);
                  if (!selectedRole) return;
                  const guide = guides.find((g) => String(g.id) === guideId);
                  if (!guide) return;
                  setAssignments((p) => [
                    ...p,
                    {
                      guide_id: guide.id,
                      guide_name: guide.full_name,
                      role: selectedRole,
                    },
                  ]);
                  setSelectedRole("");
                  setShowAddForm(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a staff member..." />
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
              <Select
                value={selectedRole}
                onValueChange={(role) => {
                  setSelectedRole(role);
                  if (!selectedGuide) return;
                  const guide = guides.find(
                    (g) => String(g.id) === selectedGuide
                  );
                  if (!guide) return;
                  setAssignments((p) => [
                    ...p,
                    {
                      guide_id: guide.id,
                      guide_name: guide.full_name,
                      role,
                    },
                  ]);
                  setSelectedRole("");
                  setShowAddForm(false);
                }}
              >
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

              <p className="text-xs text-muted-foreground">
                Select a staff member, then select their role — they'll be
                assigned automatically.
              </p>
            </>
          )}
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground w-fit"
          onClick={() => setShowAddForm(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />+ Assign another
        </Button>
      )}
    </div>
  );
}

function BookingSummary({
  form,
  tours,
  currentStep,
  assignments,
}: {
  form: BookingFormState;
  tours: Tour[];
  currentStep: number;
  assignments: Assignment[];
}) {
  const selectedTour = tours.find((t) => String(t.id) === form.tour_id);
  const pricePerAdult = selectedTour ? parseFloat(selectedTour.price) : 0;
  const pricePerChild = pricePerAdult * 0.5;
  const totalGuests = form.adults + form.children + form.infants;
  const calculatedPrice =
    form.adults * pricePerAdult + form.children * pricePerChild;
  const totalPrice = form.is_custom_tour ? form.total_price : calculatedPrice;
  const balance = totalPrice - form.amount_paid;

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5 sticky top-6">
      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
        Booking Preview
      </h3>

      <div className="space-y-4 text-sm">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Type
          </p>
          <p className="font-medium">
            {form.is_custom_tour ? "✨ Custom Tour" : "🗺️ Standard Tour"}
          </p>
        </div>

        {(selectedTour || form.is_custom_tour) && currentStep >= 2 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Tour
            </p>
            <p className="font-medium">
              {selectedTour?.tour_name ?? "Custom Tour"}
            </p>
            {selectedTour && (
              <p className="text-muted-foreground">{selectedTour.duration}</p>
            )}
          </div>
        )}

        {form.tour_date && currentStep >= 2 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Date
            </p>
            <p className="font-medium">
              {new Date(form.tour_date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            {form.is_custom_tour && form.start_time && (
              <p className="text-muted-foreground">
                {form.start_time} – {form.end_time}
              </p>
            )}
          </div>
        )}

        {form.primary_contact_name && currentStep >= 3 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Contact
            </p>
            <p className="font-medium">{form.primary_contact_name}</p>
            {form.primary_contact_email && (
              <p className="text-muted-foreground">
                {form.primary_contact_email}
              </p>
            )}
          </div>
        )}

        {currentStep >= 3 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Guests
            </p>
            <p className="font-medium">{totalGuests} total</p>
            <p className="text-muted-foreground">
              {form.adults} adults
              {form.children > 0 ? `, ${form.children} children` : ""}
              {form.infants > 0 ? `, ${form.infants} infants` : ""}
            </p>
          </div>
        )}

        {currentStep >= 4 && totalPrice > 0 && (
          <div className="pt-3 border-t space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">€{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid</span>
              <span className="text-emerald-600">
                €{form.amount_paid.toFixed(2)}
              </span>
            </div>
            {balance > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Balance due</span>
                <span className="text-red-500">€{balance.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {assignments.length > 0 && currentStep >= 5 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Guides
            </p>
            {assignments.map((a) => (
              <p key={a.guide_id} className="font-medium">
                {a.guide_name}
                <span className="text-muted-foreground font-normal ml-1 text-xs">
                  ({ROLES.find((r) => r.value === a.role)?.label})
                </span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stepper({
  currentStep,
  completedSteps,
}: {
  currentStep: number;
  completedSteps: number[];
}) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = currentStep === step.id;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                    ? "border-2 border-primary text-primary"
                    : "border-2 border-border text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <span
                className={`text-xs ${
                  isCurrent
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mb-5 transition-all ${
                  completedSteps.includes(step.id) ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function validateStep(step: number, form: BookingFormState): string | null {
  switch (step) {
    case 1:
      return null;
    case 2:
      if (!form.tour_date) return "Please select a date.";
      if (!form.is_custom_tour && !form.tour_id) return "Please select a tour.";
      if (!form.is_custom_tour && !form.time_slot_id)
        return "Please select a time slot.";
      if (form.is_custom_tour && !form.start_time)
        return "Please set a start time.";
      if (form.is_custom_tour && !form.end_time)
        return "Please set an end time.";
      return null;
    case 3:
      if (!form.primary_contact_name.trim())
        return "Primary contact name is required.";
      return null;
    case 4:
      if (form.is_custom_tour && !form.total_price)
        return "Please enter the agreed total price.";
      return null;
    case 5:
      return null;
    default:
      return null;
  }
}

const AddBooking = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<BookingFormState>(INITIAL_STATE);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [stepError, setStepError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [tours, setTours] = useState<Tour[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingTours, setIsLoadingTours] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const fetchTours = async () => {
      setIsLoadingTours(true);
      try {
        const [toursRes, slotsRes] = await Promise.all([
          axios.get(`/api/tours/simple`),
          axios.get(`/api/tours/time-slots`),
        ]);
        setTours(toursRes.data.data ?? toursRes.data);
        setTimeSlots(slotsRes.data.data ?? slotsRes.data);
      } catch {
        // tours failed to load — handled in step 2
      } finally {
        setIsLoadingTours(false);
      }
    };
    fetchTours();
  }, []);

  const handleNext = () => {
    const error = validateStep(currentStep, form);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError(null);
    setCompletedSteps((p) =>
      p.includes(currentStep) ? p : [...p, currentStep]
    );
    setCurrentStep((p) => p + 1);
  };

  const handleBack = () => {
    setStepError(null);
    setCurrentStep((p) => p - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const bookingStatus = form.is_custom_tour ? "draft" : "pending";

      const payload = {
        tour_id: form.is_custom_tour ? null : parseInt(form.tour_id),
        is_custom_tour: form.is_custom_tour,
        tour_date: form.tour_date,
        time_slot_id: form.is_custom_tour ? null : parseInt(form.time_slot_id),
        start_time: form.is_custom_tour ? form.start_time : null,
        end_time: form.is_custom_tour ? form.end_time : null,
        meeting_point: form.meeting_point || null,
        primary_contact_name: form.primary_contact_name,
        primary_contact_email: form.primary_contact_email || null,
        primary_contact_phone: form.primary_contact_phone || null,
        language: form.language,
        status: bookingStatus,
        source: form.source,
        notes: form.notes || null,
        total_price: form.is_custom_tour ? form.total_price : undefined,
      };

      const bookingRes = await axios.post(`/api/bookings/admin`, payload);
      const newBooking = bookingRes.data;
      const bookingId = newBooking.id;

      await axios.post(`/api/bookings/${bookingId}/guests`, {
        adults: form.adults,
        children: form.children,
        infants: form.infants,
      });

      const validNames = form.guest_names.filter((g) => g.full_name.trim());
      if (validNames.length > 0) {
        await axios.post(`/api/bookings/${bookingId}/guest-names`, {
          names: validNames.map((g) => g.full_name),
        });
      }

      if (form.amount_paid > 0) {
        await axios.post(`/api/bookings/${bookingId}/payments`, {
          method: form.payment_method,
          status: "paid",
          amount: form.amount_paid,
          paid_at: new Date().toISOString(),
        });
      }

      for (const assignment of assignments) {
        try {
          await axios.post(`/api/bookings/${bookingId}/assignments`, {
            guide_id: assignment.guide_id,
            role: assignment.role,
          });
        } catch (err: any) {
          console.error("assignment failed:", err.response?.data);
        }
      }

      navigate(`/bookings/${bookingId}`);
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.error ??
          "Failed to create booking. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 form={form} setForm={setForm} />;
      case 2:
        return (
          <Step2
            form={form}
            setForm={setForm}
            tours={tours}
            timeSlots={timeSlots}
            isLoadingTours={isLoadingTours}
          />
        );
      case 3:
        return <Step3 form={form} setForm={setForm} />;
      case 4:
        return <Step4 form={form} setForm={setForm} tours={tours} />;
      case 5:
        return (
          <Step5
            assignments={assignments}
            setAssignments={setAssignments}
            bookingDate={form.tour_date}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <h1 className="text-xl font-semibold">New Booking</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <Stepper
                currentStep={currentStep}
                completedSteps={completedSteps}
              />

              <div className="min-h-[320px]">{renderStep()}</div>

              {stepError && (
                <p className="mt-4 text-sm text-destructive">{stepError}</p>
              )}
              {submitError && (
                <p className="mt-4 text-sm text-destructive">{submitError}</p>
              )}

              <div className="flex justify-between mt-8 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={currentStep === 1 ? () => navigate(-1) : handleBack}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {currentStep === 1 ? "Cancel" : "Back"}
                </Button>

                {currentStep < STEPS.length ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    {currentStep === STEPS.length && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Skip & Create Booking
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        handleSubmit();
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Create Booking
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <BookingSummary
          form={form}
          tours={tours}
          currentStep={currentStep}
          assignments={assignments}
        />
      </div>
    </div>
  );
};

export default AddBooking;

function GuestCounter({
  label,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  value: number;
  min?: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          –
        </Button>
        <span className="w-6 text-center text-sm font-medium">{value}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onChange(value + 1)}
        >
          +
        </Button>
      </div>
    </div>
  );
}
