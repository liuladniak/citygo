import { describe, it, expect } from "vitest";
import { guideAssignmentJob, guideUnassignmentJob, roleLabel } from "./guideEmail.js";

const booking = {
  booking_reference: "CG-123",
  tour_name: "Old City Walk",
  tour_date: "2026-12-01",
  display_start_time: "09:00:00",
  display_end_time: "13:00:00",
  meeting_point: "Sultanahmet Square",
  total_guests: 5,
};
const guide = { name: "Ayse Demir", email: "ayse@example.com" };

describe("roleLabel", () => {
  it("names the known roles and passes unknown ones through", () => {
    expect(roleLabel("lead_guide")).toBe("Lead Guide");
    expect(roleLabel("driver")).toBe("Driver");
    expect(roleLabel("photographer")).toBe("photographer");
  });
});

describe("guideAssignmentJob", () => {
  it("builds the payload with trimmed times and a readable role", () => {
    expect(guideAssignmentJob(guide, booking, "assistant_guide")).toEqual({
      to: "ayse@example.com",
      guideName: "Ayse Demir",
      tourName: "Old City Walk",
      tourDate: "2026-12-01",
      bookingReference: "CG-123",
      role: "Assistant Guide",
      startTime: "09:00",
      endTime: "13:00",
      meetingPoint: "Sultanahmet Square",
      guests: 5,
    });
  });

  it("falls back for a custom tour with no times or meeting point", () => {
    const job = guideAssignmentJob(guide, { booking_reference: "CG-9", tour_date: "2026-12-01" }, "driver");
    expect(job).toMatchObject({ tourName: "Custom Tour", startTime: "", endTime: "", meetingPoint: "", guests: "" });
  });

  it("returns null when the guide has no email", () => {
    expect(guideAssignmentJob({ name: "No Mail", email: null }, booking, "driver")).toBeNull();
    expect(guideUnassignmentJob({ name: "No Mail" }, booking)).toBeNull();
  });
});

describe("guideUnassignmentJob", () => {
  it("only carries what the removal email shows", () => {
    expect(guideUnassignmentJob(guide, booking)).toEqual({
      to: "ayse@example.com",
      guideName: "Ayse Demir",
      tourName: "Old City Walk",
      tourDate: "2026-12-01",
      bookingReference: "CG-123",
    });
  });
});
