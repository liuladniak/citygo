import axios from "axios";
import { badRequest, HttpError } from "../../lib/errors.js";

const URL = "https://api.exchangerate-api.com/v4/latest/USD";
const TTL_MS = 60 * 60 * 1000;

type Table = { rates: Record<string, number>; fetchedAt: number };
let cache: Table | null = null;
let inflight: Promise<Table> | null = null;

async function load(now: number): Promise<Table> {
  const { data } = await axios.get(URL, { timeout: 5000 });
  cache = { rates: data.rates, fetchedAt: now };
  return cache;
}

/** Rates for one hour; if the provider is down, the last known rates are better than failing. */
async function getTable(now: number): Promise<Table> {
  if (cache && now - cache.fetchedAt < TTL_MS) return cache;
  inflight ??= load(now).finally(() => (inflight = null));
  try {
    return await inflight;
  } catch (err) {
    if (cache) return cache;
    console.error("Exchange rate lookup failed:", err);
    throw new HttpError(503, "Exchange rates are unavailable right now. Please try again.");
  }
}

/** How many units of `currency` one USD buys. */
export async function getExchangeRate(currency: string, now = Date.now()): Promise<number> {
  const code = currency.toUpperCase();
  if (code === "USD") return 1;
  const rate = (await getTable(now)).rates[code];
  if (!rate) throw badRequest(`Unsupported currency: ${currency}`);
  return rate;
}

export const resetExchangeRates = () => {
  cache = null;
  inflight = null;
};
