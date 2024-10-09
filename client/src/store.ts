import { configureStore } from "@reduxjs/toolkit";
import cartReducer, {
  CartState,
  initialState as cartInitialState,
} from "./features/cart/cartSlice";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
} from "./utils/localStorageHelpers";
import authReducer from "./features/auth/authSlice";

const persistedCartState: CartState =
  loadFromLocalStorage("cart") || cartInitialState;

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
  },
  preloadedState: {
    cart: persistedCartState || undefined,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

store.subscribe(() => {
  saveToLocalStorage("cart", store.getState().cart);
});

export default store;
