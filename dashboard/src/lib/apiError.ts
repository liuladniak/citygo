import axios from "axios";

/** The server's error text for a failed request, or `fallback`. */
export function apiErrorMessage(
  err: unknown,
  fallback: string,
  key: "error" | "message" = "error",
): string {
  if (axios.isAxiosError(err)) {
    const text = err.response?.data?.[key];
    if (typeof text === "string" && text) return text;
  }
  return fallback;
}

/** The response body of a failed request, for logging. */
export const apiErrorData = (err: unknown): unknown =>
  axios.isAxiosError(err) ? err.response?.data : err;

export const apiErrorStatus = (err: unknown): number | undefined =>
  axios.isAxiosError(err) ? err.response?.status : undefined;
