import "./Dashboard.css";
import Header from "../../components/Header/Header";

import TodaysBookingList from "../../components/TodaysBookingList/TodaysBookingList";
import TodayTeam from "../../components/TodayTeam/TodayTeam";
import arrowIcon from "../../assets/icons/arrow-up-right.svg";
import Weather from "../../components/Weather/Weather";
import { useEffect, useState } from "react";
import axios from "axios";

interface Booking {
  bookingId: number;
  user_first_name: string;
  user_last_name: string;
  tour_title: string;
  adults: number;
  children: number;
  totalPrice: number;
  bookingDate: string;
  tour_start_time: string;
  tour_end_time: string;
  status: "Requires Action" | "Confirmed" | "In Progress" | "Completed";
}

const Dashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsToday, setBookingsToday] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsPerPage] = useState(10);
  const [todayBookingSearch, setTodayBookingSearch] = useState("");
  const API_URL = import.meta.env.VITE_API_KEY;

  const fetchBookings = async (filter = "all") => {
    setIsLoading(true);
    try {
      const response = await axios.get<{ data: Booking[] }>(
        `${API_URL}/api/bookings/all?filter=${filter}`
      );
      setBookings(response.data.data);
      console.log("Bookings", response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error("There was an error fetching the tours data!", error);
      setIsLoading(false);
    }
  };
  const fetchBookingsToday = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<{ data: Booking[] }>(
        `${API_URL}/api/bookings/all?filter=today`
      );
      setBookingsToday(response.data.data);
      console.log("Bookings", response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error("There was an error fetching the tours data!", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchBookingsToday();
  }, []);

  return (
    <section className="w-full h-full">
      <Header pageTitle="Dashboard" />
      <div className="flex justify-between">
        <div className="flex flex-col gap-10 mt-8 flex-3 p-4">
          <div className="flex gap-10">
            <div className="flex gap-10">
              <div className="dashboard__stat flex items-end border border-blue-200  p-4 w-48 h-28 rounded-2xl">
                <div className="dashboard__stat--rev flex flex-col justify-between gap-5 w-full h-full">
                  <h3 className="text-sm">Total revenue today</h3>
                  <span className="text-2xl">8,500</span>
                </div>
                <div className="w-8 h-8">
                  <img src={arrowIcon} alt="arrow up right icon" />
                </div>
              </div>

              <div className="bg-gradient-to-b from-violet-200 to-transparent flex items-end border border-blue-200  p-4 w-48 h-28 rounded-2xl">
                <div className="flex flex-col justify-between gap-5 w-full h-full">
                  <h3 className="text-sm">Tours booked today</h3>
                  <span className="text-2xl">{bookingsToday.length}</span>
                </div>
                <div className="w-8 h-8">
                  <img src={arrowIcon} alt="arrow up right icon" />
                </div>
              </div>
            </div>
          </div>

          <TodaysBookingList
            bookings={bookings}
            fetchBookings={fetchBookings}
          />
        </div>
        <div className="flex flex-col gap-6 flex-1 p-4">
          <div className="">
            <Weather lat="51.5074" lon="-0.1278" />
          </div>

          <TodayTeam />
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
