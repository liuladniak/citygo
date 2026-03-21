import { useEffect, useState } from "react";
import axios from "@/lib/apiClient";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { subMonths, subYears, format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Columns } from "./Columns";
import { DataTable } from "./DataTable";
import type { Booking } from "@/types/booking";

type DateRange = "3months" | "6months" | "year" | "all";
const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("3months");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const limit = 20;
  const isServerSide = dateRange === "year" || dateRange === "all";
  const navigate = useNavigate();

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
        if (statusFilter !== "all") params.status = statusFilter;
        const response = await axios.get(`/api/bookings/all`, {
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} bookings found
          </p>
        </div>
        <Button onClick={() => navigate("/booking/add")}>
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Select value={dateRange} onValueChange={handleDateRangeChange}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">Last 3 months</SelectItem>
            <SelectItem value="6months">Last 6 months</SelectItem>
            <SelectItem value="year">This year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
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
