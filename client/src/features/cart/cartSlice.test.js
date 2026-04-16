import { describe, it, expect } from "vitest";
import cartReducer, {
  addBooking,
  removeBooking,
  updateBooking,
  clearCart,
  selectBookings,
  selectTotalBookings,
  selectIsCartEmpty,
  initialState,
} from "./cartSlice";

const makeBooking = (overrides = {}) => ({
  id: "booking-1",
  tour_id: 101,
  title: "Historical Istanbul Walking Tour",
  mainImage: "https://example.com/tour.jpg",
  date: "2026-05-15",
  timeSlot: { id: 3, start_time: "09:30:00", end_time: "13:30:00" },
  tour_time_slots: [],
  slug: "historical-istanbul-walking-tour",
  guests: { adults: 2, children: 0, infants: 0 },
  price: 50,
  featured: false,
  ...overrides,
});

describe("initial state", () => {
  it("has an empty bookings array and no totalBookings field", () => {
    const state = cartReducer(undefined, { type: "@@INIT" });
    expect(state).toEqual({ bookings: [] });
    expect(state.totalBookings).toBeUndefined();
  });
});

describe("addBooking", () => {
  it("adds a booking to an empty cart", () => {
    const booking = makeBooking();
    const state = cartReducer(initialState, addBooking(booking));

    expect(state.bookings).toHaveLength(1);
    expect(state.bookings[0]).toEqual(booking);
  });

  it("adds multiple bookings independently", () => {
    const booking1 = makeBooking({ id: "b1" });
    const booking2 = makeBooking({ id: "b2", title: "Bosphorus Cruise" });

    let state = cartReducer(initialState, addBooking(booking1));
    state = cartReducer(state, addBooking(booking2));

    expect(state.bookings).toHaveLength(2);
    expect(state.bookings[1].title).toBe("Bosphorus Cruise");
  });

  it("allows duplicate IDs — documents current known behaviour", () => {
    const booking = makeBooking({ id: "b1" });
    let state = cartReducer(initialState, addBooking(booking));
    state = cartReducer(state, addBooking(booking));

    expect(state.bookings).toHaveLength(2);
  });
});

describe("removeBooking", () => {
  it("removes the correct booking by id", () => {
    const b1 = makeBooking({ id: "b1" });
    const b2 = makeBooking({ id: "b2" });
    let state = cartReducer(initialState, addBooking(b1));
    state = cartReducer(state, addBooking(b2));
    state = cartReducer(state, removeBooking("b1"));

    expect(state.bookings).toHaveLength(1);
    expect(state.bookings[0].id).toBe("b2");
  });

  it("empties the cart when the last booking is removed", () => {
    const booking = makeBooking();
    let state = cartReducer(initialState, addBooking(booking));
    state = cartReducer(state, removeBooking(booking.id));

    expect(state.bookings).toHaveLength(0);
  });

  it("is a no-op when id does not exist", () => {
    const booking = makeBooking();
    let state = cartReducer(initialState, addBooking(booking));
    state = cartReducer(state, removeBooking("non-existent"));

    expect(state.bookings).toHaveLength(1);
  });

  it("is a no-op on an empty cart", () => {
    const state = cartReducer(initialState, removeBooking("any-id"));
    expect(state.bookings).toHaveLength(0);
  });

  it("does not mutate other bookings when one is removed", () => {
    const b1 = makeBooking({ id: "b1" });
    const b2 = makeBooking({ id: "b2", title: "Bosphorus Cruise" });
    let state = cartReducer(initialState, addBooking(b1));
    state = cartReducer(state, addBooking(b2));
    state = cartReducer(state, removeBooking("b1"));

    expect(state.bookings[0]).toEqual(b2);
  });
});

describe("updateBooking", () => {
  it("updates only the specified fields, preserving the rest", () => {
    const booking = makeBooking();
    let state = cartReducer(initialState, addBooking(booking));
    state = cartReducer(
      state,
      updateBooking({ id: booking.id, date: "2026-06-01" })
    );

    expect(state.bookings[0].date).toBe("2026-06-01");
    expect(state.bookings[0].title).toBe(booking.title);
    expect(state.bookings[0].price).toBe(booking.price);
    expect(state.bookings[0].guests).toEqual(booking.guests);
  });

  it("updates the time slot correctly", () => {
    const booking = makeBooking();
    let state = cartReducer(initialState, addBooking(booking));
    const newSlot = { id: 5, start_time: "14:00:00", end_time: "17:00:00" };
    state = cartReducer(
      state,
      updateBooking({ id: booking.id, timeSlot: newSlot })
    );

    expect(state.bookings[0].timeSlot).toEqual(newSlot);
  });

  it("updates guest counts correctly", () => {
    const booking = makeBooking();
    let state = cartReducer(initialState, addBooking(booking));
    state = cartReducer(
      state,
      updateBooking({
        id: booking.id,
        guests: { adults: 3, children: 1, infants: 0 },
      })
    );

    expect(state.bookings[0].guests).toEqual({
      adults: 3,
      children: 1,
      infants: 0,
    });
  });

  it("is a no-op when id does not exist", () => {
    const booking = makeBooking();
    let state = cartReducer(initialState, addBooking(booking));
    state = cartReducer(
      state,
      updateBooking({ id: "ghost", date: "2026-06-01" })
    );

    expect(state.bookings[0].date).toBe(booking.date);
  });

  it("does not change the number of bookings", () => {
    const booking = makeBooking();
    let state = cartReducer(initialState, addBooking(booking));
    state = cartReducer(
      state,
      updateBooking({ id: booking.id, date: "2026-06-01" })
    );

    expect(state.bookings).toHaveLength(1);
  });
});

describe("clearCart", () => {
  it("empties the bookings array", () => {
    let state = cartReducer(
      initialState,
      addBooking(makeBooking({ id: "b1" }))
    );
    state = cartReducer(state, addBooking(makeBooking({ id: "b2" })));
    state = cartReducer(state, clearCart());

    expect(state.bookings).toHaveLength(0);
  });

  it("is a no-op on an already empty cart", () => {
    const state = cartReducer(initialState, clearCart());
    expect(state.bookings).toHaveLength(0);
  });

  it("returns a new state reference — does not mutate the previous state", () => {
    const before = cartReducer(initialState, addBooking(makeBooking()));
    const after = cartReducer(before, clearCart());

    expect(after).not.toBe(before);
    expect(after.bookings).not.toBe(before.bookings);
  });
});

describe("selectors", () => {
  const stateWith = (bookings) => ({ cart: { bookings } });

  it("selectBookings returns the bookings array", () => {
    const booking = makeBooking();
    expect(selectBookings(stateWith([booking]))).toEqual([booking]);
  });

  it("selectBookings returns empty array when cart is empty", () => {
    expect(selectBookings(stateWith([]))).toEqual([]);
  });

  it("selectTotalBookings returns the correct count", () => {
    expect(selectTotalBookings(stateWith([makeBooking(), makeBooking()]))).toBe(
      2
    );
  });

  it("selectTotalBookings returns 0 for empty cart", () => {
    expect(selectTotalBookings(stateWith([]))).toBe(0);
  });

  it("selectIsCartEmpty returns true when cart is empty", () => {
    expect(selectIsCartEmpty(stateWith([]))).toBe(true);
  });

  it("selectIsCartEmpty returns false when cart has items", () => {
    expect(selectIsCartEmpty(stateWith([makeBooking()]))).toBe(false);
  });

  it("selectTotalBookings always reflects actual bookings length", () => {
    const reduxState = stateWith([
      makeBooking({ id: "b1" }),
      makeBooking({ id: "b2" }),
    ]);
    expect(selectTotalBookings(reduxState)).toBe(
      reduxState.cart.bookings.length
    );
  });
});
