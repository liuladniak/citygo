import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import Input from "../ui/Input/Input";
import "./TodaysBookingList.css";

interface Booking {
  id: number;
  user_first_name: string;
  user_last_name: string;
  tour_title: string;
  adults: number;
  children: number;
  totalPrice: number;
  bookingDate: string;
  tour_start_time: string;
  tour_end_time: string;
  status:
    | "Requires Action"
    | "Pending"
    | "Confirmed"
    | "In Progress"
    | "Denied"
    | "Completed";
}

type BookingFilter = "today" | "tomorrow" | "upcoming" | "all";

interface TodaysBookingListProps {
  bookings: Booking[];
  fetchBookings: (filter: BookingFilter) => void;
  isLoading: boolean;
  filterBookings: BookingFilter;
}

const TodaysBookingList: React.FC<TodaysBookingListProps> = ({
  bookings,
  fetchBookings,
  isLoading,
  filterBookings,
}) => {
  const [todayBookingSearch, setTodayBookingSearch] = useState("");

  const [sortConfig, setSortConfig] = useState<{
    column: keyof Booking | null;
    direction: "asc" | "desc" | "default";
  }>({
    column: null,
    direction: "default",
  });

  const statusOrder: Record<string, number> = {
    "Requires Action": 1,
    Pending: 2,
    Confirmed: 3,
    "In Progress": 4,
    Denied: 5,
    Completed: 6,
  };

  const availableStatuses = Array.from(
    new Set(bookings.map((booking) => booking.status))
  );

  const handleSort = (column: keyof Booking) => {
    setSortConfig((prevSortConfig) => {
      if (prevSortConfig.column === column) {
        return {
          column,
          direction: prevSortConfig.direction === "asc" ? "desc" : "asc",
        };
      }

      return { column, direction: "asc" };
    });
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    if (sortConfig.direction === "default") {
      return statusOrder[a.status] - statusOrder[b.status];
    } else {
      const valueA = a[sortConfig.column as keyof Booking];
      const valueB = b[sortConfig.column as keyof Booking];

      if (typeof valueA === "string" && typeof valueB === "string") {
        const lowerA = valueA.toLowerCase();
        const lowerB = valueB.toLowerCase();

        if (lowerA < lowerB) return sortConfig.direction === "asc" ? -1 : 1;
        if (lowerA > lowerB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      } else {
        if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      }
    }
  });

  const filteredBookings = sortedBookings.filter((booking) => {
    const searchTerm = todayBookingSearch.toLowerCase().trim();

    return (
      booking.tour_title.toLowerCase().includes(searchTerm) ||
      booking.user_first_name.toLowerCase().includes(searchTerm) ||
      booking.user_last_name.toLowerCase().includes(searchTerm) ||
      booking.adults.toString().includes(searchTerm) ||
      booking.children.toString().includes(searchTerm) ||
      booking.tour_start_time.includes(searchTerm)
    );
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTodayBookingSearch(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as BookingFilter;
    fetchBookings(selected);
  };

  return (
    <div className="flex-1 rounded-lg border  shadow-xs bg-white border-slate-200 p-6">
      <div className="flex items-center justify-between ">
        <h2 className="t-bookings__heading text-base mt-4 mb-6 font-semibold">
          {filterBookings === "all"
            ? "Bookings"
            : `Bookings for ${filterBookings}`}
        </h2>
        <Link
          to="/booking/add"
          className="py-2 px-4 m-w grow-0 whitespace-nowrap bg-brand-teal text-white rounded-md"
        >
          + Add New Booking
        </Link>
      </div>
      <div className="flex gap-6 items-center">
        <div className="w-80 flex-1">
          <Input
            type="text"
            name="t-booking-search"
            value={todayBookingSearch}
            onChange={handleInputChange}
            placeholder="Search"
          />
        </div>

        <div className="flex gap-4 flex-1">
          <select
            value={filterBookings}
            onChange={handleFilterChange}
            className="border p-2 rounded-md custom-select"
          >
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="upcoming">Upcoming</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      <ul className="flex flex-col gap-4 text-xs ">
        <li className="font-semibold cursor-pointer flex justify-between w-full border border-light-gray rounded-md py-2 items-center">
          <span
            className="flex-1"
            onClick={() => handleSort("tour_title")}
            style={{ cursor: "pointer" }}
          >
            Tour name{" "}
            {sortConfig.column === "tour_title" ? (
              <span className="ml-2">
                {sortConfig.direction === "asc" ? "↑" : "↓"}
              </span>
            ) : (
              <span className="ml-2">↑</span>
            )}
          </span>
          <span
            className="flex-1"
            onClick={() => handleSort("user_first_name")}
            style={{ cursor: "pointer" }}
          >
            Customer name{" "}
            {sortConfig.column === "user_first_name" ? (
              <span className="ml-2">
                {sortConfig.direction === "asc" ? "↑" : "↓"}
              </span>
            ) : (
              <span className="ml-2">↑</span>
            )}
          </span>
          <span
            className="flex-1"
            onClick={() => handleSort("tour_start_time")}
            style={{ cursor: "pointer" }}
          >
            Tour time{" "}
            {sortConfig.column === "tour_start_time" ? (
              <span className="ml-2">
                {sortConfig.direction === "asc" ? "↑" : "↓"}
              </span>
            ) : (
              <span className="ml-2">↑</span>
            )}
          </span>
          <span
            className="flex-1"
            onClick={() => handleSort("adults")}
            style={{ cursor: "pointer" }}
          >
            Number of guests{" "}
            {sortConfig.column === "adults" ? (
              <span className="ml-2">
                {sortConfig.direction === "asc" ? "↑" : "↓"}
              </span>
            ) : (
              <span className="ml-2">↑</span>
            )}
          </span>
          <span
            className="flex-1"
            onClick={() => handleSort("status")}
            style={{ cursor: "pointer" }}
          >
            Status
            {sortConfig.column === "status" ? (
              <span className="ml-2">
                {sortConfig.direction === "asc" ? "↑" : "↓"}
              </span>
            ) : (
              <span className="ml-2">↑</span>
            )}
          </span>
        </li>

        {!isLoading && filteredBookings.length === 0 ? (
          <div className="no-bookings-message">
            {filterBookings === "upcoming" ? (
              <p>{`No ${filterBookings} bookings`}</p>
            ) : (
              <p>{`No bookings for ${filterBookings}`}</p>
            )}
          </div>
        ) : (
          <Fragment>
            {filteredBookings.map((booking) => (
              <li key={booking.id} className="hover:bg-gray-100">
                <Link
                  className="cursor-pointer flex justify-between w-full border border-light-gray rounded-md py-2 items-center"
                  to={`/booking/${booking.id}`}
                >
                  <span className="flex-1">{booking.tour_title}</span>
                  <span className="flex-1">
                    {booking.user_first_name} {booking.user_last_name}
                  </span>
                  <span className="flex-1">
                    {booking.tour_start_time} - {booking.tour_end_time}
                  </span>
                  <span className="flex-1">
                    {booking.adults + booking.children}
                  </span>
                  <div className="flex-1 flex justify-start">
                    <span
                      className={`py-2 px-4 w-fit rounded-md t-bookings__status t-bookings__status--${booking.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </Fragment>
        )}
      </ul>
    </div>
  );
};

export default TodaysBookingList;
