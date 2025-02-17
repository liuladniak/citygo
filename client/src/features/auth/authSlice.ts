import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface User {
  id: number;
  name: string;
  email: string;
}
interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  user: User | null;
}

const initialAuthState: AuthState = {
  isLoggedIn: !!localStorage.getItem("token"),
  token: localStorage.getItem("token"),
  user: (() => {
    const user = localStorage.getItem("user");
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
      localStorage.removeItem("user");
      return null;
    }
  })(),
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    login(
      state,
      action: PayloadAction<{
        token: string;
        tokenExpiration: string;
        user: User;
      }>
    ) {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("tokenExpiration", action.payload.tokenExpiration);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    logout(state) {
      state.isLoggedIn = false;
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiration");
      localStorage.removeItem("user");
    },
    checkToken(state) {
      const token = localStorage.getItem("token");
      const tokenExpiration = localStorage.getItem("tokenExpiration");
      const user = localStorage.getItem("user");
      if (
        !token ||
        (tokenExpiration && new Date().getTime() > +tokenExpiration)
      ) {
        state.isLoggedIn = false;
        state.token = null;
        state.user = null;
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiration");
        localStorage.removeItem("user");
      } else {
        state.isLoggedIn = true;
        state.token = token;
        state.user = user ? JSON.parse(user) : null;
      }
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = true;
    },
  },
});

export const { login, logout, checkToken, setUser } = authSlice.actions;
export default authSlice.reducer;
