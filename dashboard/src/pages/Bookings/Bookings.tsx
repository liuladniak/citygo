import "./Bookings.css";
// import { useEffect, useState } from "react";
// import axios from "axios";
import Header from "../../components/Header/Header";
import BookingsList from "../../components/BookingsList/BookingsList";
// interface Booking {
//   tour_name: string;
// }

const Bookings = () => {
  // const API_URL = import.meta.env.VITE_API_KEY;

  // const [bookings, setBookings] = useState<Booking[]>([]);
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   const getBookingsData = async () => {
  //     try {
  //       const response = await axios.get(`${API_URL}/tours`);
  //       const bookings = response.data;
  //       setBookings(bookings);
  //       setIsLoading(false);
  //     } catch (error) {
  //       console.error("There was an error fetching the tours data!");
  //       setIsLoading(false);
  //     }
  //   };
  //   getBookingsData();
  // }, []);

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <section className="bookings">
      {/* <Header pageTitle="Bookings" /> */}

      <BookingsList />

      {/* {bookings.map((booking, i) => (
        <p key={i}>{booking.tour_name}</p>
      ))} */}
    </section>
  );
};

export default Bookings;
