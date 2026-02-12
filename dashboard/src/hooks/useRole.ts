import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type Role = "admin" | "manager" | "associate";

export function useRole(userId?: string) {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setRole(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          setRole(null);
        } else {
          setRole(data?.role ?? null);
        }
        setLoading(false);
      });
  }, [userId]);

  return { role, loading };
}
