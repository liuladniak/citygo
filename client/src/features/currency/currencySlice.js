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

// export const fetchExchangeRates = createAsyncThunk(
//   "currency/fetchExchangeRates",
//   async () => {
//     try {
//       const response = await axios.get(
//         "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json"
//       );
//       return response.data.usd;
//     } catch (error) {
//       console.error("Error fetching exchange rates:", error);
//       throw error;
//     }
//   }
// );

export const fetchExchangeRates = createAsyncThunk(
  "currency/fetchExchangeRates",
  async (_, { getState }) => {
    try {
      const response = await axios.get(
        "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
      );
      return response.data.usd;
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      throw error;
    }
  },
  {
    condition: (_, { getState }) => {
      const { currency } = getState();
      if (currency.status === "loading" || currency.status === "succeeded") {
        return false;
      }
      return true;
    },
  },
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
        state.status = "loading";
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.exchangeRates = action.payload;
      })
      .addCase(fetchExchangeRates.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;
