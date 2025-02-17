import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  bookings: [],
  totalBookings: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addBooking: (state, action) => {
      state.bookings.push(action.payload);
      state.totalBookings = state.bookings.length;
    },
    removeBooking: (state, action) => {
      state.bookings = state.bookings.filter(
        (booking) => booking.id !== action.payload
      );
      state.totalBookings = state.bookings.length;
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
      state.totalBookings = 0;
    },
  },
});

export const { addBooking, removeBooking, updateBooking, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
