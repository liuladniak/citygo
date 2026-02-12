import "./Dashboard.css";
import Header from "../../components/Header/Header";
import Weather from "../../components/Weather/Weather";
import { useEffect, useState } from "react";
import axios from "axios";
import CustomButton from "../../components/ui/CustomButton/CustomButton";
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
import { Button } from "@/components/ui/button";
import { FilePlus2 } from "lucide-react";
import { ChartBarLabel } from "@/components/AppBarChart";
import {
  ChartAreaInteractive,
  ChartBarMultiple,
} from "@/components/ChartAreaDefault";
import { ChartPieDonutText } from "@/components/AppPieChart";
import CardList from "@/components/CardList";
import TodoList from "@/components/TodoList";
import { Booking } from "@/types/booking";

const Dashboard: React.FC<{ pageTitle: string }> = ({ pageTitle }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsToday, setBookingsToday] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsPerPage] = useState(10);
  const [todayBookingSearch, setTodayBookingSearch] = useState("");
  const [filterBookings, setFilterBookings] = useState<string>("all");
  const API_URL = import.meta.env.VITE_API_KEY;

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
    <section className="w-full h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
        <div className="bg-primary-foreground p-4 rounded-lg ">
          <ChartBarLabel />
        </div>
        <div className="bg-primary-foreground p-4 rounded-lg ">
          <MainStats />{" "}
        </div>
        <div className="bg-primary-foreground p-4 rounded-lg">
          {" "}
          <ChartPieDonutText />
        </div>

        <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2">
          <CardList bookings={bookings} title="Latest Bookings" />
        </div>
        <div className="flex flex-col gap-4">
          {" "}
          <TodoList /> <Team />
        </div>
      </div>
    </section>
  );
};

export default Dashboard;

const PageTitle = ({ pageTitle }) => {
  return <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>;
};
