export type Slot = { start_time: string; end_time: string };
export type StoredSlot = Slot & { id: number };

const minutes = (time: string) => time.slice(0, 5);
const same = (a: Slot, b: Slot) => minutes(a.start_time) === minutes(b.start_time) && minutes(a.end_time) === minutes(b.end_time);

/**
 * Works out how to turn a tour's stored slots into the wanted list without touching bookings:
 * new slots are added, slots no longer wanted are removed, except any a booking points at,
 * which stay so the booking keeps its time.
 */
export function planSlotSync(stored: StoredSlot[], wanted: Slot[], bookedSlotIds: ReadonlySet<number>) {
  const toAdd: Slot[] = [];
  for (const slot of wanted) {
    if (!stored.some((s) => same(s, slot)) && !toAdd.some((s) => same(s, slot))) toAdd.push(slot);
  }
  const removable = stored.filter((s) => !wanted.some((w) => same(s, w)));
  return {
    toAdd,
    toDelete: removable.filter((s) => !bookedSlotIds.has(s.id)).map((s) => s.id),
    keptBecauseBooked: removable.filter((s) => bookedSlotIds.has(s.id)).map((s) => s.id),
  };
}
