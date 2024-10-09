import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
}

const initialAuthState: AuthState = {
  isLoggedIn: !!sessionStorage.getItem("token"),
  token: sessionStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    login(
      state,
      action: PayloadAction<{ token: string; tokenExpiration: string }>
    ) {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      sessionStorage.setItem("token", action.payload.token);
      sessionStorage.setItem("tokenExpiration", action.payload.tokenExpiration);
    },
    logout(state) {
      state.isLoggedIn = false;
      state.token = null;
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("tokenExpiration");
    },
    checkToken(state) {
      const token = sessionStorage.getItem("token");
      const tokenExpiration = sessionStorage.getItem("tokenExpiration");
      if (
        !token ||
        (tokenExpiration && new Date().getTime() > +tokenExpiration)
      ) {
        state.isLoggedIn = false;
        state.token = null;
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("tokenExpiration");
      } else {
        state.isLoggedIn = true;
        state.token = token;
      }
    },
  },
});

export const { login, logout, checkToken } = authSlice.actions;
export default authSlice.reducer;
