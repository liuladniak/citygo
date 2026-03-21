interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  profile_image: string | null;
  phone?: string;
  notif_new_booking?: boolean;
  notif_cancellation?: boolean;
  notif_daily_schedule?: boolean;
  notif_unassigned_tours?: boolean;
}

import { useEffect, useState, useCallback } from "react";
import apiClient from "@/lib/apiClient";
import { useAuth } from "./useAuth";

const fetchEmployee = async (email: string) => {
  const { data } = await apiClient.get(`/api/employees/by-email`, {
    params: { email },
  });
  return data;
};

export function useEmployee() {
  const { user, loading: authLoading } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user?.email) {
      setEmployee(null);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchEmployee(user.email);
      setEmployee(data);
    } catch {
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    employee,
    loading: authLoading || loading,
    googleAvatar: user?.user_metadata?.avatar_url ?? null,
    refetch: fetch,
  };
}
