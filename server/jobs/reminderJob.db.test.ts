import { beforeEach, describe, expect, it, vi } from "vitest";
import { db, resetDb } from "../test/db.js";
import { makeTimeSlot, makeTour } from "../test/fixtures.js";
import { bookings } from "../db/drizzle/schema.js";

const queue = vi.hoisted(() => ({ add: vi.fn() }));
vi.mock("../queues/notificationQueue.js", () => ({ notificationQueue: queue }));

import { reminderJobId, reminderPayload, sendReminders } from "./reminderJob.js";

// 2026-11-22 23:30 in Istanbul is already 20:30 UTC on the 22nd: tomorrow is the 23rd either way,
// but at 00:30 Istanbul (21:30 UTC) the UTC date still says the 22nd.
const AT_0030_ISTANBUL = new Date("2026-11-22T21:30:00Z");

beforeEach(async () => {
  await resetDb();
  queue.add.mockReset();
  vi.spyOn(console, "log").mockImplementation(() => {});
});

let ref = 0;
async function makeBooking(overrides: Partial<typeof bookings.$inferInsert> = {}) {
  ref += 1;
  const tour = await makeTour({ includes: "Tea", essentials: "Comfortable shoes" });
  const [row] = await db
    .insert(bookings)
    .values({
      tourId: tour.id, tourDate: "2026-11-23", isCustomTour: true, startTime: "09:30:00", endTime: "13:00:00",
      primaryContactName: "Ayla", primaryContactEmail: `ayla${ref}@example.test`, status: "confirmed", source: "website",
      bookingReference: `BK-R-${ref}`, meetingPoint: "Hagia Sophia", ...overrides,
    })
    .returning();
  return row;
}

describe("sendReminders", () => {
  it("queues one reminder per confirmed booking tomorrow, by Istanbul's calendar", async () => {
    const b = await makeBooking();
    await sendReminders(AT_0030_ISTANBUL); // tomorrow in Istanbul is the 24th, today's UTC date is the 22nd
    expect(queue.add).not.toHaveBeenCalled();

    await sendReminders(new Date("2026-11-22T06:00:00Z")); // 09:00 Istanbul on the 22nd
    expect(queue.add).toHaveBeenCalledTimes(1);
    expect(queue.add).toHaveBeenCalledWith(
      "booking-reminder",
      {
        to: b.primaryContactEmail, userName: "Ayla", tourName: "Old City Walk", bookingReference: b.bookingReference,
        bookingDate: "2026-11-23", bookingTime: "09:30", meetingPoint: "Hagia Sophia", includes: "Tea", essentials: "Comfortable shoes",
      },
      { jobId: reminderJobId(b.id, "2026-11-23") },
    );
  });

  it("skips other days, other statuses, missing emails and demo addresses", async () => {
    await makeBooking({ tourDate: "2026-11-24" });
    await makeBooking({ status: "pending" });
    await makeBooking({ status: "cancelled" });
    await makeBooking({ primaryContactEmail: null });
    await makeBooking({ primaryContactEmail: "demo@seed.example.com" });
    await sendReminders(new Date("2026-11-22T06:00:00Z"));
    expect(queue.add).not.toHaveBeenCalled();
  });

  it("takes the start time from the time slot for regular bookings", async () => {
    const tour = await makeTour();
    const slot = await makeTimeSlot(tour.id, { startTime: "15:00:00", endTime: "18:00:00" });
    await db.insert(bookings).values({
      tourId: tour.id, timeSlotId: slot.id, tourDate: "2026-11-23", primaryContactName: "Ben", primaryContactEmail: "ben@example.test",
      status: "confirmed", source: "website", bookingReference: "BK-SLOT",
    });
    await sendReminders(new Date("2026-11-22T06:00:00Z"));
    expect(queue.add.mock.calls[0][1]).toMatchObject({ bookingTime: "15:00", meetingPoint: "" });
  });

  it("gives a repeat run the same job id so the guest is not emailed twice", async () => {
    await makeBooking();
    await sendReminders(new Date("2026-11-22T06:00:00Z"));
    await sendReminders(new Date("2026-11-22T06:30:00Z"));
    expect(queue.add.mock.calls[0][2]).toEqual(queue.add.mock.calls[1][2]);
  });

  it("does not throw when the queue is down", async () => {
    await makeBooking();
    queue.add.mockRejectedValueOnce(new Error("redis down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(sendReminders(new Date("2026-11-22T06:00:00Z"))).resolves.toBeUndefined();
  });
});

describe("reminderPayload", () => {
  it("falls back to readable defaults", () => {
    expect(
      reminderPayload({
        id: 1, primary_contact_email: "a@b.test", primary_contact_name: "A", booking_reference: "BK", tour_date: "2026-11-23",
        tour_name: null, includes: null, essentials: null, start_time: null, meeting_point: null,
      }),
    ).toMatchObject({ tourName: "Custom Tour", bookingTime: "", meetingPoint: "", includes: "", essentials: "" });
  });
});
