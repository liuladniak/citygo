import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { startApp } from "../../test/app.js";
import { db, resetDb } from "../../test/db.js";
import { makeComment, makeEmployee, makeTask, makeTour } from "../../test/fixtures.js";
import { bookingAssignments, bookingPayments, bookings, taskComments, tasks } from "../../db/drizzle/schema.js";
import taskRoutes from "./tasks.routes.js";

let manager: Awaited<ReturnType<typeof startApp>>;
let guide: Awaited<ReturnType<typeof startApp>>;
let boss: Awaited<ReturnType<typeof makeEmployee>>;
let worker: Awaited<ReturnType<typeof makeEmployee>>;

beforeAll(async () => {
  manager = await startApp(taskRoutes, { role: "manager", email: "boss@example.test" });
  guide = await startApp(taskRoutes, { role: "guide", email: "worker@example.test" });
});
afterAll(async () => {
  await Promise.all([manager.close(), guide.close()]);
});
beforeEach(async () => {
  await resetDb();
  boss = await makeEmployee({ firstName: "Bo", lastName: "Ss", email: "boss@example.test", profileImage: "/bo.jpg" });
  worker = await makeEmployee({ firstName: "Wo", lastName: "Rker", email: "worker@example.test" });
});

let ref = 0;
async function makeBooking(overrides: Partial<typeof bookings.$inferInsert> = {}) {
  ref += 1;
  const tour = await makeTour();
  const [row] = await db
    .insert(bookings)
    .values({
      tourId: tour.id, tourDate: "2099-06-01", isCustomTour: true, startTime: "09:00:00", endTime: "13:00:00",
      primaryContactName: "Guest", status: "confirmed", source: "website", bookingReference: `BK-T-${ref}`,
      totalPrice: "100.00", meetingPoint: "Hagia Sophia", ...overrides,
    })
    .returning();
  return row;
}

describe("GET /", () => {
  it("lists tasks with assignee, creator and booking details", async () => {
    const b = await makeBooking();
    const t = await makeTask({ title: "Call guest", assignedTo: worker.id, createdBy: boss.id, bookingId: b.id, dueDate: "2026-12-01 10:00:00" });
    const res = await manager.get("/");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      id: t.id, title: "Call guest", type: "general", priority: "normal", status: "open", assigned_to: worker.id, created_by: boss.id,
      booking_id: b.id, is_auto_generated: false, assignee_name: "Wo Rker", assignee_image: null, creator_name: "Bo Ss", booking_reference: b.bookingReference,
    });
    expect(res.body[0].due_date).toBe("2026-12-01T10:00:00.000Z");
    expect(res.body[0].created_at).toMatch(/^\d{4}-\d{2}-\d{2}T.*Z$/);
  });

  it("orders urgent first, then assigned before unassigned, then earliest due date", async () => {
    await makeTask({ title: "low", priority: "low" });
    await makeTask({ title: "normal unassigned", priority: "normal" });
    await makeTask({ title: "normal late", priority: "normal", assignedTo: worker.id, dueDate: "2026-12-09 00:00:00" });
    await makeTask({ title: "normal soon", priority: "normal", assignedTo: worker.id, dueDate: "2026-12-01 00:00:00" });
    await makeTask({ title: "urgent", priority: "urgent" });
    const res = await manager.get("/");
    expect(res.body.map((t: any) => t.title)).toEqual(["urgent", "normal soon", "normal late", "normal unassigned", "low"]);
  });

  it("filters by status, priority, type, assignee, with unassigned on request, and hides archived", async () => {
    await makeTask({ title: "mine", assignedTo: worker.id });
    await makeTask({ title: "nobody" });
    await makeTask({ title: "theirs", assignedTo: boss.id, priority: "urgent", status: "in_progress", type: "auto_x" });
    await makeTask({ title: "old", archivedAt: "2026-01-01 00:00:00" });
    const titles = async (q: string) => (await manager.get(`/${q}`)).body.map((t: any) => t.title).sort();
    expect(await titles("")).toEqual(["mine", "nobody", "theirs"]);
    expect(await titles("?include_archived=true")).toContain("old");
    expect(await titles("?status=in_progress")).toEqual(["theirs"]);
    expect(await titles("?priority=urgent")).toEqual(["theirs"]);
    expect(await titles("?type=auto_x")).toEqual(["theirs"]);
    expect(await titles(`?assigned_to=${worker.id}`)).toEqual(["mine"]);
    expect(await titles(`?assigned_to=${worker.id}&include_unassigned=true`)).toEqual(["mine", "nobody"]);
    expect(await titles("?limit=2")).toHaveLength(2);
  });
});

describe("GET /:id", () => {
  it("returns the task with its comments, oldest first, with who wrote them", async () => {
    const t = await makeTask({ assignedTo: worker.id });
    await makeComment(t.id, "first", boss.id);
    await makeComment(t.id, "second", null);
    const res = await manager.get(`/${t.id}`);
    expect(res.status).toBe(200);
    expect(res.body.comments.map((c: any) => c.content)).toEqual(["first", "second"]);
    expect(res.body.comments[0]).toMatchObject({ task_id: t.id, author_id: boss.id, author_name: "Bo Ss", author_image: "/bo.jpg" });
    expect(res.body.comments[1]).toMatchObject({ author_id: null, author_name: null });
    expect((await manager.get("/999999")).status).toBe(404);
  });
});

describe("creating, changing and cancelling", () => {
  it("creates a task with defaults and returns it with details", async () => {
    const res = await manager.post("/", { title: "Book a van", created_by: boss.id, assigned_to: worker.id });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: "Book a van", type: "general", priority: "normal", status: "open", is_auto_generated: false, assignee_name: "Wo Rker" });
    expect((await manager.post("/", {})).status).toBe(400);
  });

  it("stamps completion when done and clears it when reopened", async () => {
    const t = await makeTask();
    const done = await manager.patch(`/${t.id}`, { status: "done" });
    expect(done.body.status).toBe("done");
    expect(done.body.completed_at).toMatch(/Z$/);
    const reopened = await manager.patch(`/${t.id}`, { status: "open", title: "Renamed", assigned_to: worker.id });
    expect(reopened.body).toMatchObject({ status: "open", completed_at: null, title: "Renamed", assigned_to: worker.id });
    expect((await manager.patch("/999999", { title: "x" })).status).toBe(404);
  });

  it("cancels instead of deleting", async () => {
    const t = await makeTask();
    expect((await manager.delete(`/${t.id}`)).body).toEqual({ success: true });
    expect((await db.select().from(tasks).where(eq(tasks.id, t.id)))[0].status).toBe("cancelled");
  });

  it("adds a comment and returns it with the author", async () => {
    const t = await makeTask();
    const res = await manager.post(`/${t.id}/comments`, { content: "On it", author_id: boss.id });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ task_id: t.id, content: "On it", author_name: "Bo Ss" });
    expect((await manager.post(`/${t.id}/comments`, {})).status).toBe(400);
  });
});

describe("bulk close", () => {
  async function autoTask(kind: string, booking: { id: number }) {
    return makeTask({ title: `[${kind}] Do the thing`, bookingId: booking.id, isAutoGenerated: true });
  }

  it("preview sorts tasks into ready, unresolved and skipped without changing anything", async () => {
    const needsGuide = await makeBooking();
    const fine = await makeBooking();
    await db.insert(bookingAssignments).values({ bookingId: fine.id, guideId: worker.id, role: "lead_guide", status: "active" });
    const unresolved = await autoTask("auto_assign_guide", needsGuide);
    const resolved = await autoTask("auto_assign_guide", fine);
    const plain = await makeTask();
    const closed = await makeTask({ status: "done", completedBy: boss.id });
    const archived = await makeTask({ archivedAt: "2026-01-01 00:00:00" });

    const res = await manager.post("/bulk-close/preview", { ids: [unresolved.id, resolved.id, plain.id, closed.id, archived.id, 999999] });
    expect(res.status).toBe(200);
    expect(res.body.ready.sort()).toEqual([resolved.id, plain.id].sort());
    expect(res.body.unresolved).toEqual([{ id: unresolved.id, title: "Do the thing", reason: `${needsGuide.bookingReference} still has no guide` }]);
    expect(res.body.skipped).toEqual(
      expect.arrayContaining([
        { id: closed.id, title: closed.title, reason: "already closed by Bo Ss" },
        { id: archived.id, title: archived.title, reason: "no longer active" },
        { id: 999999, title: "Task #999999", reason: "no longer active" },
      ]),
    );
    expect((await db.select().from(tasks).where(eq(tasks.id, plain.id)))[0].status).toBe("open");
  });

  it("flags unpaid, no-meeting-point and draft bookings, and respects what is already settled", async () => {
    const unpaid = await makeBooking({ totalPrice: "100.00" });
    await db.insert(bookingPayments).values([{ bookingId: unpaid.id, amount: "40.00", status: "paid" }, { bookingId: unpaid.id, amount: "60.00", status: "pending" }] as any);
    const paid = await makeBooking({ totalPrice: "50.00" });
    await db.insert(bookingPayments).values({ bookingId: paid.id, amount: "50.00", status: "paid" } as any);
    const noPoint = await makeBooking({ meetingPoint: null });
    const draft = await makeBooking({ status: "draft" });
    const cancelled = await makeBooking({ status: "cancelled" });
    const ids = [
      (await autoTask("auto_collect_payment", unpaid)).id,
      (await autoTask("auto_collect_payment", paid)).id,
      (await autoTask("auto_set_meeting_point", noPoint)).id,
      (await autoTask("auto_review_custom", draft)).id,
      (await autoTask("auto_assign_guide", cancelled)).id,
    ];
    const res = await manager.post("/bulk-close/preview", { ids });
    const reasons = Object.fromEntries(res.body.unresolved.map((u: any) => [u.id, u.reason]));
    expect(reasons[ids[0]]).toBe(`${unpaid.bookingReference} still has €60.00 due`);
    expect(reasons[ids[2]]).toBe(`${noPoint.bookingReference} still has no meeting point`);
    expect(reasons[ids[3]]).toBe(`${draft.bookingReference} is still a draft`);
    expect(res.body.ready.sort()).toEqual([ids[1], ids[4]].sort());
  });

  it("marks ready tasks done, never unresolved ones, and records who closed them", async () => {
    const b = await makeBooking();
    const unresolved = await autoTask("auto_assign_guide", b);
    const plain = await makeTask();
    const res = await manager.post("/bulk-close", { ids: [unresolved.id, plain.id], action: "done" });
    expect(res.status).toBe(200);
    expect(res.body.updated).toEqual([plain.id]);
    expect(res.body.unresolved.map((u: any) => u.id)).toEqual([unresolved.id]);
    const [row] = await db.select().from(tasks).where(eq(tasks.id, plain.id));
    expect(row).toMatchObject({ status: "done", completedBy: boss.id });
    expect((await db.select().from(tasks).where(eq(tasks.id, unresolved.id)))[0].status).toBe("open");
  });

  it("dismisses even unresolved tasks, but only for managers and with a reason, leaving a comment", async () => {
    const b = await makeBooking();
    const unresolved = await autoTask("auto_assign_guide", b);
    expect((await guide.post("/bulk-close", { ids: [unresolved.id], action: "dismiss", reason: "not needed" })).status).toBe(403);
    expect((await manager.post("/bulk-close", { ids: [unresolved.id], action: "dismiss", reason: "x" })).status).toBe(400);
    const res = await manager.post("/bulk-close", { ids: [unresolved.id], action: "dismiss", reason: "Guest cancelled by phone" });
    expect(res.body.updated).toEqual([unresolved.id]);
    expect((await db.select().from(tasks).where(eq(tasks.id, unresolved.id)))[0].status).toBe("dismissed");
    const [comment] = await db.select().from(taskComments).where(eq(taskComments.taskId, unresolved.id));
    expect(comment).toMatchObject({ content: "Dismissed: Guest cancelled by phone", authorId: boss.id });
  });

  it("reopens done and dismissed tasks", async () => {
    const done = await makeTask({ status: "done", completedAt: "2026-01-01 00:00:00", completedBy: boss.id });
    const dismissed = await makeTask({ status: "dismissed" });
    const open = await makeTask();
    const res = await guide.post("/bulk-close", { ids: [done.id, dismissed.id, open.id], action: "reopen" });
    expect(res.body.updated.sort()).toEqual([done.id, dismissed.id].sort());
    expect((await db.select().from(tasks).where(eq(tasks.id, done.id)))[0]).toMatchObject({ status: "open", completedAt: null, completedBy: null });
  });

  it("validates the request", async () => {
    expect((await manager.post("/bulk-close", { ids: [], action: "done" })).status).toBe(400);
    expect((await manager.post("/bulk-close", { ids: ["a"], action: "done" })).status).toBe(400);
    expect((await manager.post("/bulk-close", { ids: Array.from({ length: 201 }, (_, i) => i + 1), action: "done" })).status).toBe(400);
    expect((await manager.post("/bulk-close", { ids: [1], action: "explode" })).status).toBe(400);
    expect((await manager.post("/bulk-close/preview", {})).status).toBe(400);
  });
});

describe("who did it, and what is allowed", () => {
  it("records the signed-in person, not whoever the request claims", async () => {
    const created = await manager.post("/", { title: "Spoof", created_by: worker.id });
    expect(created.body.created_by).toBe(boss.id);

    const t = await makeTask();
    const done = await manager.patch(`/${t.id}`, { status: "done", completed_by: worker.id });
    expect(done.body.completed_by).toBe(boss.id);
    const reopened = await manager.patch(`/${t.id}`, { status: "open" });
    expect(reopened.body.completed_by).toBeNull();

    const comment = await manager.post(`/${t.id}/comments`, { content: "Hi", author_id: worker.id });
    expect(comment.body.author_id).toBe(boss.id);
  });

  it("cannot dismiss through the single-task update, which skips the manager rule", async () => {
    const t = await makeTask();
    expect((await guide.patch(`/${t.id}`, { status: "dismissed" })).status).toBe(400);
  });

  it("takes ids as text from select boxes and blank as none", async () => {
    const t = await makeTask({ assignedTo: worker.id });
    const res = await manager.patch(`/${t.id}`, { assigned_to: "", due_date: "2026-12-05" });
    expect(res.body).toMatchObject({ assigned_to: null, assignee_name: null, due_date: "2026-12-05T00:00:00.000Z" });
    expect((await manager.patch(`/${t.id}`, { assigned_to: String(boss.id) })).body.assigned_to).toBe(boss.id);
  });

  it("rejects bad input and unknown tasks", async () => {
    const t = await makeTask();
    expect((await manager.post("/", { title: "x", priority: "whenever" })).status).toBe(400);
    expect((await manager.post("/", { title: "x", due_date: "not a date" })).status).toBe(400);
    expect((await manager.get("/abc")).status).toBe(400);
    expect((await manager.get("/?assigned_to=abc")).status).toBe(400);
    expect((await manager.post("/999999/comments", { content: "x" })).status).toBe(404);
    expect((await manager.patch(`/${t.id}`, { title: "" })).status).toBe(400);
  });
});
