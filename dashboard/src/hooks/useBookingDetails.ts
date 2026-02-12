import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DetailedBooking } from "@/types/booking";

export const useBookingDetails = (id: string | undefined) => {
  const API_URL = import.meta.env.VITE_API_KEY;
  return useQuery<DetailedBooking>({
    queryKey: ["booking", id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/api/bookings/${id}`);
      return data;
    },
    enabled: !!id,
  });
};
