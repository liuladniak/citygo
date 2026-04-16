import { configureStore } from "@reduxjs/toolkit";
import cartReducer, {
  initialState as cartInitialState,
} from "./features/cart/cartSlice";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
} from "./utils/localStorageHelpers";
import authReducer from "./features/auth/authSlice";
import currencyReducer, {
  fetchExchangeRates,
} from "./features/currency/currencySlice";
import wishlistReducer, {
  initialState as wishlistInitialState,
} from "./features/wishlist/wishlistSlice";

const persistedCartState = loadFromLocalStorage("cart") || cartInitialState;

const sanitisedCartState = persistedCartState
  ? { bookings: persistedCartState.bookings ?? [] }
  : cartInitialState;

const persistedWishlistState =
  loadFromLocalStorage("wishlist") || wishlistInitialState;

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    wishlist: wishlistReducer,
    currency: currencyReducer,
  },
  preloadedState: {
    cart: sanitisedCartState || undefined,
    wishlist: persistedWishlistState,
  },
});
store.dispatch(fetchExchangeRates());
store.subscribe(() => {
  saveToLocalStorage("cart", store.getState().cart);
  saveToLocalStorage("wishlist", store.getState().wishlist);
});
