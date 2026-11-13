import { createContext, useContext } from "react";
import type { MiloContextValue } from "./miloTypes";

export const MiloContext = createContext<MiloContextValue | null>(null);

export function useMilo() {
  const ctx = useContext(MiloContext);
  if (!ctx) throw new Error("useMilo must be used inside MiloProvider");
  return ctx;
}
