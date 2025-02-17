import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
} from "../../utils/localStorageHelpers";

const persistedCurrency = loadFromLocalStorage("currency") || "USD";

const initialState = {
  selectedCurrency: persistedCurrency || "USD",
  exchangeRates: {},
  status: "idle",
};

export const fetchExchangeRates = createAsyncThunk(
  "currency/fetchExchangeRates",
  async () => {
    try {
      console.log("Fetching exchange rates...");
      const response = await axios.get(
        "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json"
      );
      console.log("API Response in Thunk:", response.data);
      return response.data.usd;
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      throw error;
    }
  }
);

const currencySlice = createSlice({
  name: "currency",

  initialState,
  reducers: {
    setCurrency: (state, action) => {
      state.selectedCurrency = action.payload;
      saveToLocalStorage("currency", action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRates.pending, (state) => {
        console.log("Fetching exchange rates...");
        state.status = "loading";
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        console.log("Exchange Rates Fulfilled:", action.payload);
        state.status = "succeeded";
        state.exchangeRates = action.payload;
      })
      .addCase(fetchExchangeRates.rejected, (state) => {
        console.log("Exchange Rates Rejected");
        state.status = "failed";
      });
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;
