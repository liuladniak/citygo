import { Database } from "./database.types";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

export interface StaffMember {
  id?: number;
  guide_id: number;
  guide_name: string;
  role: string;
  profile_image?: string;
  phone?: string;
}

export interface Booking extends BookingRow {
  tour_name?: string;
  staff?: StaffMember[] | null;
  total_price?: number | string;
  amount_paid?: number | string;
  total_guests?: number;
  display_start_time?: string;
  display_end_time?: string;
}
export type InsertBooking = Database["public"]["Tables"]["bookings"]["Insert"];
export type UpdateBooking = Database["public"]["Tables"]["bookings"]["Update"];

export interface GuestDistribution {
  adults: number;
  children: number;
  infants: number;
}

export interface DetailedBooking extends Booking {
  tour_duration?: string;
  guest_distribution?: GuestDistribution;
  guest_list?: { full_name: string }[];
  payment_history?: any[];
}
