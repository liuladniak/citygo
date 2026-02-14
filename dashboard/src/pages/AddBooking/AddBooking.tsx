import { useState } from "react";
import Icon from "../../components/ui/SVGIcons/Icon";
import {
  clockPath,
  creditCardPath,
  locationIconPath,
  notesPath,
  personPath,
} from "../../components/ui/SVGIcons/iconPaths";
import BackButton from "../../components/ui/BackButton";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type BookingFormState = {
  tour_id: string;
  date: string;
  start_time: string;
  end_time?: string;

  meeting_point?: string;

  primary_contact: {
    name: string;
    email: string;
    phone: string;
  };

  guest_counts: {
    adults: number;
    children: number;
    infants: number;
  };

  guest_names: {
    id: string;
    full_name: string;
  }[];

  language?: string;

  payment: {
    method: "cash" | "card" | "bank" | "paypal" | "stripe";
    status: "pending" | "paid" | "partial" | "refunded";
    amount?: number;
  };

  notes?: string;
};

// type BookingSource =
//   | "website"
//   | "admin_dashboard"
//   | "walk_in"
//   | "phone"
//   | "email";

const AddBooking = () => {
  const [formData, setFormData] = useState<BookingFormState>({
    tour_id: "",
    date: "",
    start_time: "",
    end_time: undefined,
    meeting_point: undefined,

    primary_contact: {
      name: "",
      email: "",
      phone: "",
    },

    guest_counts: {
      adults: 1,
      children: 0,
      infants: 0,
    },

    guest_names: [],

    language: undefined,

    payment: {
      method: "cash",
      status: "pending",
      amount: 0,
    },

    notes: "",
  });

  const [showGuests, setShowGuests] = useState(false);
  const isCustomTour = formData.tour_id === "3";

  const selectedTour = {
    "1": {
      name: "Tour 1",
      duration: "4 hours",
      price: 120,
      meeting_point: "xyz",
    },
    "2": {
      name: "Tour 2",
      duration: "6 hours",
      price: 180,
      meeting_point: "sdfs",
    },
    "3": {
      name: "Custom Tour",
      duration: "Flexible",
      price: 200,
      meeting_point: "sdf",
    },
  }[formData.tour_id];
  const totalGuests =
    formData.guest_counts.adults +
    formData.guest_counts.children +
    formData.guest_counts.infants;

  const pricePerAdult = selectedTour?.price ?? 0;
  const pricePerChild = pricePerAdult * 0.5;

  const calculatedStandardPrice =
    formData.guest_counts.adults * pricePerAdult +
    formData.guest_counts.children * pricePerChild;

  const totalPrice = isCustomTour
    ? formData.payment.amount ?? 0
    : calculatedStandardPrice;

  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // const BOOKING_SOURCE: BookingSource = "admin_dashboard";
  // function deriveBookingStatus(
  //   paymentStatus: BookingFormState["payment"]["status"]
  // ) {
  //   if (paymentStatus === "paid" || paymentStatus === "partial") {
  //     return "pending_assignment";
  //   }
  //   return "pending_payment";
  // }
  // const bookingPayload = {
  //   tour_id: formData.tour_id,
  //   date: formData.date,
  //   start_time: formData.start_time,

  //   meeting_point: isCustomTour
  //     ? formData.meeting_point
  //     : selectedTour?.meeting_point,

  //   primary_contact: formData.primary_contact,

  //   guests: formData.guest_counts,

  //   guest_names: formData.guest_names.filter((g) => g.full_name.trim()),

  //   language: formData.language,

  //   payment: {
  //     ...formData.payment,
  //     amount: totalPrice,
  //   },

  //   status: deriveBookingStatus(formData.payment.status),

  //   source: BOOKING_SOURCE,
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}/api/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add booking.");
      }

      alert("Booking added successfully!");
    } catch (err) {
      setError("Error adding booking. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center">
        <BackButton />
        <CardTitle>Add New Booking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-3 gap-8 ">
          {error && <p className="text-red-500">{error}</p>}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 p-4 bg-card shadow-md rounded-lg "
          >
            <div className="flex items-center gap-2 mb-4">
              <Icon iconPath={personPath} className="mb-1 text-blue-600" />
              <h3 className="text-lg font-semibold text-foreground leading-none ">
                Customer Information
              </h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="space-y-2">
                <Label htmlFor="primary_contact_name">
                  Primary Contact Name
                </Label>
                <Input
                  type="text"
                  id="primary_contact_name"
                  name="primary_contact_name"
                  value={formData.primary_contact.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      primary_contact: {
                        ...prev.primary_contact,
                        name: e.target.value,
                      },
                    }))
                  }
                  placeholder="Enter full name"
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="primary_contact_email">
                  Primary Contact Email
                </Label>

                <Input
                  type="email"
                  id="primary_contact_email"
                  name="primary_contact_email"
                  value={formData.primary_contact.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      primary_contact: {
                        ...prev.primary_contact,
                        email: e.target.value,
                      },
                    }))
                  }
                  placeholder="johndoe@example.com"
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="primary_contact_phone">
                  Primary Contact Phone Number
                </Label>

                <Input
                  type="tel"
                  id="primary_contact_phone"
                  name="primary_contact_phone"
                  value={formData.primary_contact.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      primary_contact: {
                        ...prev.primary_contact,
                        phone: e.target.value,
                      },
                    }))
                  }
                  placeholder="+90 123 123 0000"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowGuests((prev) => !prev)}
              >
                {showGuests ? "Hide guest names" : "Add guest names (optional)"}
              </Button>

              {showGuests && (
                <div className="space-y-3 mt-4">
                  <Label>Guest Names (optional)</Label>

                  {formData.guest_names.map((guest, index) => (
                    <div key={guest.id} className="flex gap-2 items-center">
                      <Input
                        placeholder={`Guest ${index + 1} full name`}
                        value={guest.full_name}
                        onChange={(e) => {
                          const updated = [...formData.guest_names];
                          updated[index].full_name = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            guest_names: updated,
                          }));
                        }}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            guest_names: prev.guest_names.filter(
                              (g) => g.id !== guest.id
                            ),
                          }))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        guest_names: [
                          ...prev.guest_names,
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

            <div className="space-y-4 mb-8">
              <GuestCounter
                label="Adults"
                value={formData.guest_counts.adults}
                min={1}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    guest_counts: { ...prev.guest_counts, adults: val },
                  }))
                }
              />

              <GuestCounter
                label="Children (2–14)"
                value={formData.guest_counts.children}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    guest_counts: { ...prev.guest_counts, children: val },
                  }))
                }
              />

              <GuestCounter
                label="Infants (0–2)"
                value={formData.guest_counts.infants}
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    guest_counts: { ...prev.guest_counts, infants: val },
                  }))
                }
              />
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Icon
                iconPath={locationIconPath}
                className="mb-1 text-blue-600"
              />
              <h3 className="text-lg font-semibold text-foreground leading-none self-center">
                Tour Selection
              </h3>
            </div>
            <div className="mb-8">
              <div className="mb-4">
                <Label htmlFor="tour_id">Select Tour</Label>
                <Select
                  value={formData.tour_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, tour_id: value }))
                  }
                >
                  <SelectTrigger id="tour_id">
                    <SelectValue placeholder="Choose a tour" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="1">Tour 1</SelectItem>
                    <SelectItem value="2">Tour 2</SelectItem>
                    <SelectItem value="3">Custom Tour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isCustomTour && (
                <div className="mb-4">
                  <Label htmlFor="meeting_point">Meeting Point</Label>
                  <Input
                    id="meeting_point"
                    name="meeting_point"
                    placeholder="Enter meeting point address or description"
                    value={formData.meeting_point}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        meeting_point: e.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Required for custom tours
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Icon iconPath={clockPath} className="mb-1 text-blue-600" />
              <h3 className="text-lg font-semibold text-foreground leading-none">
                Tour Details
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="mb-4">
                <Label htmlFor="booking_date">Tour Date</Label>
                <input
                  type="date"
                  id="booking_date"
                  name="booking_date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  required
                  className="w-full h-10 p-2 border border-border rounded-md"
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="start_time">Start Time</Label>
                <Select
                  value={formData.start_time}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, start_time: value }))
                  }
                >
                  <SelectTrigger id="start_time">
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">09:00</SelectItem>
                    <SelectItem value="13:00">13:00</SelectItem>
                    <SelectItem value="17:00">17:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-4">
                <Label htmlFor="start_time">End Time</Label>

                <Select
                  value={formData.end_time}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, end_time: value }))
                  }
                >
                  <SelectTrigger id="end_time">
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">12:00</SelectItem>
                    <SelectItem value="13:00">15:00</SelectItem>
                    <SelectItem value="17:00">18:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <Label htmlFor="preferred_language">Preferred Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferred_language: value,
                    }))
                  }
                >
                  <SelectTrigger id="preferred_language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Icon iconPath={creditCardPath} className="mb-1 text-blue-600" />
              <h3 className="text-lg font-semibold text-foreground leading-none">
                Payment Details
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="mb-4">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select
                  value={formData.payment.method}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      payment: {
                        ...prev.payment,
                        method: value as BookingFormState["payment"]["method"],
                      },
                    }))
                  }
                >
                  <SelectTrigger id="payment_method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Credit / Debit Card</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="stripe">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isCustomTour ? (
                <div className="mb-4">
                  <Label htmlFor="price_amount">Total Price (€)</Label>
                  <Input
                    id="price_amount"
                    type="number"
                    min={0}
                    value={formData.payment.amount ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        payment: {
                          ...prev.payment,
                          amount: Number(e.target.value),
                        },
                      }))
                    }
                    placeholder="Agreed total price"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the agreed total price for the custom tour
                  </p>
                </div>
              ) : (
                <div className="mb-4">
                  <Label>Total Price (€)</Label>
                  <div className="h-10 flex items-center rounded-md border px-3 text-muted-foreground">
                    {calculatedStandardPrice} €
                  </div>
                </div>
              )}

              <div className="mb-4">
                <Label htmlFor="payment_status">Payment Status</Label>
                <select
                  id="payment_status"
                  name="payment_status"
                  value={formData.payment.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      payment: {
                        ...prev.payment,
                        status: e.target
                          .value as BookingFormState["payment"]["status"],
                      },
                    }))
                  }
                  required
                  className="w-full h-10 p-2 border border-border rounded-md"
                >
                  <option value="1">Pending</option>
                  <option value="2">Paid</option>
                  <option value="3">Partial Payment</option>
                  <option value="3">Refunded</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4 ">
              <Icon iconPath={notesPath} className="mb-1 text-blue-600" />
              <h3 className="text-lg font-semibold text-foreground leading-none">
                Notes & Special Requests
              </h3>
            </div>
            <div className="mb-8">
              <div className="mb-4">
                <Label htmlFor="additional_comments">Additional Comments</Label>
                <textarea
                  id="additional_comments"
                  name="additional_comments"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Special requests, dietary restrictions, accessibility needs, or
                any other important information..."
                  required
                  className="w-full p-2 border border-border rounded-md"
                ></textarea>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-3 w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-200"
              >
                Add Booking
              </Button>

              <Button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 w-full  p-2 rounded-md hover:bg-blue-700 transition duration-200"
              >
                Cancel
              </Button>
            </div>
          </form>
          <div className="space-y-6 bg-card shadow-md rounded-lg h-fit">
            <h3 className="text-lg p-6 font-semibold text-foreground leading-none ">
              Booking Preview
            </h3>
            <div className="px-6">
              <div>
                <h4 className="font-medium text-sm uppercase tracking-wide">
                  Primary contact:
                </h4>
                <p>{formData.primary_contact.name}</p>
              </div>
              {formData.guest_names.length > 0 && (
                <ul className="text-sm space-y-1">
                  <h4 className="font-medium text-sm uppercase tracking-wide">
                    Other guests:
                  </h4>
                  {formData.guest_names
                    .filter((g) => g.full_name.trim())
                    .map((g) => (
                      <li key={g.id}>• {g.full_name}</li>
                    ))}
                </ul>
              )}

              <div>
                <h4 className="font-medium text-sm uppercase tracking-wide">
                  Tour
                </h4>
                <p className="font-medium">
                  {selectedTour?.name || "No tour selected"}
                </p>
                <p className="text-sm"> {selectedTour?.duration || "-"}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm uppercase tracking-wide">
                  DETAILS
                </h4>

                <p>Booking date: {formData.date}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm uppercase tracking-wide">
                  PRICING
                </h4>
                <div className="flex justify-between text-sm">
                  <p>Base price per person</p>
                  <span>{selectedTour?.price || "-"} €</span>
                </div>
              </div>
              <div>
                <div className=" font-semibold pt-2 border-t border-border">
                  <p>{formData.guest_counts.adults} Adults, </p>
                  {formData.guest_counts.children > 0 && (
                    <p>{formData.guest_counts.children} Children, </p>
                  )}
                  {formData.guest_counts.infants > 0 && (
                    <p>{formData.guest_counts.infants} Infants </p>
                  )}

                  <p>Total guests: {totalGuests}</p>
                  <p>Total price: {totalPrice} €</p>
                </div>
                <div className="flex justify-between text-sm">
                  <p>Payment Status:</p>
                  <span>{formData.payment.status || "Not selected"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <div className="flex items-center justify-between">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          –
        </Button>
        <span className="w-6 text-center">{value}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onChange(value + 1)}
        >
          +
        </Button>
      </div>
    </div>
  );
}
