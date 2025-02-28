import "./TodaysBookingList.css";
import { Link } from "react-router-dom";
import Input from "../ui/Input/Input";
import { useState } from "react";
import Button from "../ui/Button/Button";
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
interface TodaysBookingListProps {
  bookings: Booking[];
  fetchBookings: (filter: "today" | "tomorrow" | "upcoming" | "all") => void;
}
const TodaysBookingList: React.FC<TodaysBookingListProps> = ({
  bookings,
  fetchBookings,
}) => {
  const [todayBookingSearch, setTodayBookingSearch] = useState("");

  // const sortedBookings = [...bookings].sort((a, b) => {
  //   const statusOrder: { [key: string]: number } = {
  //     "Requires Action": 1,
  //     Confirmed: 2,
  //     "In Progress": 3,
  //     Completed: 4,
  //   };

  //   return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
  // });

  const statusOrder: { [key in Booking["status"]]: number } = {
    "Requires Action": 1,
    Confirmed: 2,
    "In Progress": 3,
    Completed: 4,
  };

  const sortedBookings = [...bookings].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );
  console.log("Sorted Bookings", sortedBookings);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTodayBookingSearch(e.target.value);
  };

  const filteredBookings = sortedBookings.filter((booking) => {
    const searchTerm = todayBookingSearch.toLowerCase();

    return (
      booking.tour_title.toLowerCase().includes(searchTerm) ||
      booking.user_first_name.toLowerCase().includes(searchTerm) ||
      booking.adults.toString().includes(searchTerm) ||
      booking.children.toString().includes(searchTerm) ||
      booking.tour_start_time.includes(searchTerm)
    );
  });

  return (
    <div className="">
      <div className="flex items-center justify-between ">
        <h2 className="t-bookings__heading text-base  mt-4 mb-6 font-semibold">
          All Upcoming Bookings
        </h2>
        <Button className="py-2 px-4 m-w grow-0 whitespace-nowrap bg-brandTeal text-white">
          + Add New Booking
        </Button>
      </div>
      <div className="flex gap-6 items-center">
        <div className="w-80 flex-1">
          <Input
            type="text"
            name="t-booking-search"
            value={todayBookingSearch}
            onChange={(e) => handleInputChange(e)}
            placeholder="Search"
          />
        </div>
        <div className="flex gap-4 flex-1">
          <Button onClick={() => fetchBookings("today")}>Today</Button>
          <Button onClick={() => fetchBookings("tomorrow")}>Tomorrow</Button>
          <Button onClick={() => fetchBookings("upcoming")}>Upcoming</Button>
          <Button onClick={() => fetchBookings("all")}>All</Button>
        </div>
      </div>

      <ul className="flex flex-col gap-4 text-xs ">
        <li className="font-semibold cursor-pointer flex justify-between w-full border border-lightGray rounded-md py-2  items-center">
          <span className="flex-1">Tour name</span>
          <span className="flex-1">Customer name</span>
          <span className="flex-1">Tour time</span>
          <span className="flex-1">Number of guests</span>
          <span className="flex-1">Status</span>
        </li>
        {filteredBookings.map((booking) => (
          <li key={booking.bookingId}>
            <Link
              className="cursor-pointer flex justify-between w-full border border-lightGray rounded-md py-2 items-center"
              to="/"
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
      </ul>
    </div>
  );
};

export default TodaysBookingList;
