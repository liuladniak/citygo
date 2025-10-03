import "./Dashboard.css";
import Header from "../../components/Header/Header";
import Weather from "../../components/Weather/Weather";
import { useEffect, useState } from "react";
import axios from "axios";
import Button from "../../components/ui/Button/Button";
import {
  addPath,
  reportsIconPath,
} from "../../components/ui/SVGIcons/iconPaths";
import MyTasks from "../../components/MyTasks/MyTasks";
import MyStats from "../../components/MyStats/MyStats";
import Team from "../../components/Team/Team";
import MainStats from "../../components/StatsDashboard/MainStats";
import RecentBookings from "../../components/RecentBookings/RecentBookings";
import PopularProducts from "../../components/PopularTours/PopularTours";
import WebsiteVisitStats from "../../components/AppVisitStats/AppVisitStats";

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

const Dashboard: React.FC<{ pageTitle: string }> = ({ pageTitle }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsToday, setBookingsToday] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsPerPage] = useState(10);
  const [todayBookingSearch, setTodayBookingSearch] = useState("");
  const [filterBookings, setFilterBookings] = useState<string>("all");
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
      setFilterBookings(filter);
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
      {/* <Header /> */}
      <div className="p-6 flex-1 bg-gray-50 overflow-auto">
        <PageTitle pageTitle="Dashboard" />
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Welcome back! Here's what's happening with your tours today.
          </p>{" "}
          <div
            className="flex gap-2
          "
          >
            <Button to="/booking/add" IconPath={addPath} className="flex">
              New Booking
            </Button>
            <Button IconPath={reportsIconPath}>Create Report</Button>
          </div>
        </div>
        <div className="flex justify-between">
          <MainStats />
          <WebsiteVisitStats />
        </div>
        <div className="flex items-center gap-6 mt-8">
          <div className="flex flex-col gap-6 w-full lg:flex-row">
            <MyTasks />

            <RecentBookings />

            <PopularProducts />
          </div>
        </div>
        <div className="flex gap-6 mt-8  ">
          <MyStats />
          <Team />

          <div className="flex-1 rounded-lg border  shadow-sm bg-white border-slate-200">
            <Weather lat="51.5074" lon="-0.1278" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;

const PageTitle = ({ pageTitle }) => {
  return <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>;
};
