import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Booking {
  id: string;
  title: string;
  date: string;
  time: string;
  price: number;
  mainImage: string;
}

export interface CartState {
  bookings: Booking[];
  totalBookings: number;
}

export const initialState: CartState = {
  bookings: [],
  totalBookings: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addBooking: (state, action: PayloadAction<Booking>) => {
      state.bookings.push(action.payload);
      state.totalBookings = state.bookings.length;
    },
    removeBooking: (state, action: PayloadAction<string>) => {
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
        state.bookings[index] = action.payload;
      }
    },
  },
});

export const { addBooking, removeBooking, updateBooking } = cartSlice.actions;
export default cartSlice.reducer;
