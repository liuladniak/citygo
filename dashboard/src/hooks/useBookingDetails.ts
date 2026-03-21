import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/apiClient";
import { DetailedBooking } from "@/types/booking";

export const useBookingDetails = (id: string | undefined) => {
  return useQuery<DetailedBooking>({
    queryKey: ["booking", id],
    queryFn: async () => {
      const { data } = await axios.get(`/api/bookings/${id}`);
      return data;
    },
    enabled: !!id,
  });
};
