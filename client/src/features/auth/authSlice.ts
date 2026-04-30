import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabaseClient";

interface User {
  first_name: string;
  last_name: string;
  email: string;
  preferred_name?: string | null;
  phone_number?: string | null;
  notification_preference?: boolean;
  gift_credit?: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
}

const initialAuthState: AuthState = {
  isLoggedIn: false,
  user: null,
  loading: true,
};

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return rejectWithValue("No session");

      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) throw new Error("Profile fetch failed");
      return await response.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    setUser(state, action) {
      state.isLoggedIn = true;
      state.user = action.payload;
      state.loading = false;
    },
    clearUser(state) {
      state.isLoggedIn = false;
      state.user = null;
      state.loading = false;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoggedIn = true;
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.isLoggedIn = false;
        state.user = null;
        state.loading = false;
      });
  },
});

export const { setUser, clearUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
