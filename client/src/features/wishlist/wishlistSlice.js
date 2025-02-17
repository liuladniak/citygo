import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  favorites: [],
  totalFavorites: 0,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addFavorite: (state, action) => {
      const exists = state.favorites.some(
        (favorite) => favorite.id === action.payload.id
      );
      if (!exists) {
        state.favorites.push(action.payload);
        state.totalFavorites = state.favorites.length;
      }
    },
    removeFavorite: (state, action) => {
      state.favorites = state.favorites.filter(
        (favorite) => favorite.id !== action.payload
      );
      state.totalFavorites = state.favorites.length;
    },
  },
});

export const { addFavorite, removeFavorite } = wishlistSlice.actions;
export default wishlistSlice.reducer;
