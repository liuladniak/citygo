import { useEffect, useState } from "react";
import axios from "axios";
import { Booking } from "@/types/booking";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { CardHeader, CardTitle } from "@/components/ui/card";
import BackButton from "@/components/ui/BackButton";

const Bookings = () => {
  const API_URL = import.meta.env.VITE_API_KEY;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getBookingsData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/bookings/all`);
        const bookings = response.data;
        console.log("Bookings******", bookings);
        setBookings(bookings.data);
        setIsLoading(false);
      } catch (error) {
        console.error("There was an error fetching the bookings data!");
        setIsLoading(false);
      }
    };
    getBookingsData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto">
      <CardHeader className="flex items-center px-0">
        <BackButton />
        <CardTitle>Bookings List</CardTitle>
      </CardHeader>
      <DataTable columns={columns} data={bookings} />
    </div>
  );
};

export default Bookings;
