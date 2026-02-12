import { Database } from "./database.types";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
export interface Booking extends BookingRow {
  tour_name?: string;
  guide_name?: string;
  total_price?: number | string;
  amount_paid?: number | string;
  total_guests?: number;
  display_start_time?: string;
  display_end_time?: string;
}
// export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type InsertBooking = Database["public"]["Tables"]["bookings"]["Insert"];
export type UpdateBooking = Database["public"]["Tables"]["bookings"]["Update"];

export interface GuestDistribution {
  adults: number;
  children: number;
  infants: number;
}

export interface DetailedBooking extends Booking {
  tour_duration?: string;
  guide_phone?: string;
  guide_image?: string;
  guest_distribution?: GuestDistribution;
  guest_list?: { full_name: string }[];
  payment_history?: any[];
}
