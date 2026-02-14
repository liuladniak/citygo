import "./Dashboard.css";
import { useEffect, useState } from "react";
import axios from "axios";
import Team from "../../components/Team/Team";
import MainStats from "../../components/StatsDashboard/MainStats";
import { ChartBarLabel } from "@/components/AppBarChart";
import { ChartPieDonutText } from "@/components/AppPieChart";
import CardList from "@/components/CardList";
import TodoList from "@/components/TodoList";
import { Booking } from "@/types/booking";
import MyTasks from "@/components/MyTasks/MyTasks";

const Dashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
          <CardList bookings={bookings} />
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
