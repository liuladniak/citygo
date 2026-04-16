import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  bookings: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addBooking: (state, action) => {
      state.bookings.push(action.payload);
    },
    removeBooking: (state, action) => {
      state.bookings = state.bookings.filter(
        (booking) => booking.id !== action.payload
      );
    },
    updateBooking: (state, action) => {
      const index = state.bookings.findIndex(
        (booking) => booking.id === action.payload.id
      );
      if (index !== -1) {
        state.bookings[index] = { ...state.bookings[index], ...action.payload };
      }
    },
    clearCart: (state) => {
      state.bookings = [];
    },
  },
});

export const selectBookings = (state) => state.cart.bookings;
export const selectTotalBookings = (state) => state.cart.bookings.length;
export const selectIsCartEmpty = (state) => state.cart.bookings.length === 0;

export const { addBooking, removeBooking, updateBooking, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
