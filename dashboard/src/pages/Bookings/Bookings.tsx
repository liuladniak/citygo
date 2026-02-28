import { useEffect, useState } from "react";
import axios from "axios";
import { Booking } from "@/types/booking";
import { Columns } from "./Columns";
import { CardHeader, CardTitle } from "@/components/ui/card";
import BackButton from "@/components/ui/BackButton";
import { DataTable } from "./DataTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { subMonths, subYears, format } from "date-fns";

type DateRange = "3months" | "6months" | "year" | "all";
const Bookings = () => {
  const API_URL = import.meta.env.VITE_API_KEY;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("3months");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const limit = 20;

  const isServerSide = dateRange === "year" || dateRange === "all";

  const getDateFrom = (range: DateRange): string | undefined => {
    const now = new Date();
    if (range === "3months") return format(subMonths(now, 3), "yyyy-MM-dd");
    if (range === "6months") return format(subMonths(now, 6), "yyyy-MM-dd");
    if (range === "year") return format(subYears(now, 1), "yyyy-MM-dd");
    return undefined;
  };

  useEffect(() => {
    const getBookingsData = async () => {
      try {
        setIsLoading(true);
        const params: Record<string, any> = {
          dateFrom: getDateFrom(dateRange),
        };

        if (isServerSide) {
          params.page = page;
          params.limit = limit;
          params.search = search || undefined;
        } else {
          params.limit = 9999;
        }

        const response = await axios.get(`${API_URL}/api/bookings/all`, {
          params,
        });
        setBookings(response.data.data);
        setTotal(response.data.total);
      } catch (error) {
        console.error("There was an error fetching the bookings data!");
      } finally {
        setIsLoading(false);
      }
    };
    getBookingsData();
  }, [page, search, dateRange]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDateRangeChange = (value: DateRange) => {
    setDateRange(value);
    setPage(1);
    setSearch("");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto">
      <CardHeader className="flex items-center px-0">
        <BackButton />
        <CardTitle>Bookings List</CardTitle>
      </CardHeader>

      <div className="mb-4">
        <Select value={dateRange} onValueChange={handleDateRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">Last 3 months</SelectItem>
            <SelectItem value="6months">Last 6 months</SelectItem>
            <SelectItem value="year">This year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={Columns}
        data={bookings}
        isServerSide={isServerSide}
        page={page}
        total={total}
        limit={limit}
        onPageChange={setPage}
        onSearchChange={handleSearch}
        search={search}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Bookings;
