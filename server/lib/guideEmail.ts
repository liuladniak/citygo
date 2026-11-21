// Payloads for the guide assignment emails. The notifications worker builds the email.

const ROLE_LABELS: Record<string, string> = {
  lead_guide: "Lead Guide",
  assistant_guide: "Assistant Guide",
  driver: "Driver",
};

export const roleLabel = (role: string): string => ROLE_LABELS[role] ?? role;

type Booking = {
  booking_reference?: string | null;
  tour_name?: string | null;
  tour_date?: string | Date | null;
  display_start_time?: string | null;
  display_end_time?: string | null;
  meeting_point?: string | null;
  total_guests?: number | string | null;
};

type Guide = { name: string; email?: string | null };

const base = (guide: Guide, booking: Booking) => ({
  to: guide.email as string,
  guideName: guide.name,
  tourName: booking.tour_name || "Custom Tour",
  tourDate: booking.tour_date,
  bookingReference: booking.booking_reference ?? "",
});

// Returns null when the guide has no email, so the caller can skip the job.
export function guideAssignmentJob(guide: Guide, booking: Booking, role: string) {
  if (!guide.email) return null;
  return {
    ...base(guide, booking),
    role: roleLabel(role),
    startTime: booking.display_start_time?.slice(0, 5) || "",
    endTime: booking.display_end_time?.slice(0, 5) || "",
    meetingPoint: booking.meeting_point || "",
    guests: booking.total_guests ?? "",
  };
}

export function guideUnassignmentJob(guide: Guide, booking: Booking) {
  if (!guide.email) return null;
  return base(guide, booking);
}
