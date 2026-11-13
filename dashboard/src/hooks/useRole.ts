import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type Role = "admin" | "manager" | "associate";

export function useRole(userId?: string) {
  // Remember which user the role belongs to, so there is never a render where
  // a new user is shown as "not loading" with no role yet.
  const [result, setResult] = useState<{ forId: string; role: Role | null } | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      let role: Role | null = null;
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();
        if (error) console.error(error);
        else role = data?.role ?? null;
      } catch (err) {
        console.error("Could not load the role:", err);
      }
      if (!cancelled) setResult({ forId: userId, role });
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!userId) return { role: null as Role | null, loading: false };
  const ready = result?.forId === userId;
  return { role: ready ? result.role : null, loading: !ready };
}
