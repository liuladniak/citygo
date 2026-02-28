import { useEffect, useState } from "react";
import axios from "axios";
import Team from "../../components/Team/Team";
import MainStats from "../../components/StatsDashboard/MainStats";
import { ChartBarLabel } from "@/components/AppBarChart";
import CardList from "@/components/CardList";
import TodoList from "@/components/TodoList";
import { Booking } from "@/types/booking";
import { DashboardRange } from "@/types/dashboard";

import { format, addDays } from "date-fns";
import { ActivityFeed } from "@/components/ActivityFeed";

const getDateParams = (range: DashboardRange) => {
  const now = new Date();
  const today = format(now, "yyyy-MM-dd");

  switch (range) {
    case "today":
      return { dateFrom: today, dateTo: today };
    case "tomorrow":
      const tomorrow = format(addDays(now, 1), "yyyy-MM-dd");
      return { dateFrom: tomorrow, dateTo: tomorrow };
    case "week":
      const weekEnd = format(addDays(now, 7), "yyyy-MM-dd");
      return { dateFrom: today, dateTo: weekEnd };
    case "upcoming":
    default:
      return { dateFrom: today, dateTo: undefined };
  }
};

const Dashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState<DashboardRange>("upcoming");
  const API_URL = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    const getDashboardBookings = async () => {
      try {
        setIsLoading(true);
        const { dateFrom, dateTo } = getDateParams(range);

        const response = await axios.get(`${API_URL}/api/bookings/all`, {
          params: {
            dateFrom,
            dateTo,
            limit: 5,
          },
        });
        setBookings(response.data.data);
      } catch (error) {
        console.error("There was an error fetching the bookings data!");
      } finally {
        setIsLoading(false);
      }
    };
    getDashboardBookings();
  }, [range]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="w-full h-full">
      <div className="flex flex-col gap-6 p-4">
        <MainStats />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="self-start w-full">
              <CardList
                bookings={bookings}
                range={range}
                onRangeChange={setRange}
              />
            </div>
            <ActivityFeed />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6">
            <TodoList />
            <Team />
            <ChartBarLabel />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
