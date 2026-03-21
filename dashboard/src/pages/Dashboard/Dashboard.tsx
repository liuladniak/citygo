import { useEffect, useState } from "react";
import axios from "@/lib/apiClient";
import { addDays, format } from "date-fns";
// import { useAuth } from "@/hooks/useAuth";
import { useEmployee } from "@/hooks/useEmployee";
// import { useRole } from "@/hooks/useRole";
import { ActivityFeed } from "@/components/ActivityFeed";
import CardList from "@/components/CardList";
import MainStats from "@/components/MainStats";
import Team from "@/components/Team";
import TodoList from "@/components/TodoList";
import type { Booking } from "@/types/booking";
import type { DashboardRange } from "@/types/dashboard";

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
  // const { user } = useAuth();
  // const { role } = useRole(user?.id);
  // const isManager = role === "admin" || role === "manager";
  const { employee } = useEmployee();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    const getDashboardBookings = async () => {
      try {
        setIsLoading(true);
        const { dateFrom, dateTo } = getDateParams(range);

        const response = await axios.get(`/api/bookings/all`, {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {getGreeting()}, {employee?.first_name ?? "there"} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
        </div>
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
