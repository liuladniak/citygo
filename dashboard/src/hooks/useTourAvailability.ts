import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";

export function useTourAvailability(slug: string | null) {
  return useQuery({
    queryKey: ["tour-availability", slug],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/tours/${slug}/unavailable-dates`
      );
      return data as {
        specific: {
          id: number;
          unavailable_date: string;
          reason: string | null;
        }[];
        recurring: { id: number; day_of_week: number; reason: string | null }[];
      };
    },
    enabled: !!slug,
  });
}
