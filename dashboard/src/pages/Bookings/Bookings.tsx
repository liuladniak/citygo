import { useEffect, useState } from "react";
import "./Bookings.scss";
import axios from "axios";
import { API_URL } from "../../utils/api";

interface Booking {
  tour_name: string;
}

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getBookingsData = async () => {
      try {
        const response = await axios.get(`${API_URL}/tours`);
        const bookings = response.data;
        setBookings(bookings);
        setIsLoading(false);
      } catch (error) {
        console.error("There was an error fetching the tours data!");
        setIsLoading(false);
      }
    };
    getBookingsData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {bookings.map((booking, i) => (
        <p key={i}>{booking.tour_name}</p>
      ))}
    </div>
  );
};

export default Bookings;
