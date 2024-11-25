import "./TodaysBookingList.css";
import bookingsData from "../../data/todaysBookings.json";
import { Link } from "react-router-dom";
import Input from "../ui/Input/Input";
import { useState } from "react";
import Button from "../ui/Button/Button";

interface User {
  userId: number;
  name: string;
  email: string;
  phone: string;
}

interface Tour {
  tourId: number;
  title: string;
  date: string;
  time: string;
  pricePerPerson: number;
}

interface Booking {
  bookingId: number;
  user: User;
  tour: Tour;
  numberOfPeople: number;
  totalPrice: number;
  bookingDate: string;
  status: "Requires Action" | "Confirmed" | "In Progress" | "Completed";
}
const bookings: Booking[] = bookingsData as Booking[];
const TodaysBookingList = () => {
  const sortedBookings = [...bookings].sort((a, b) => {
    const statusOrder: { [key: string]: number } = {
      "Requires Action": 1,
      Confirmed: 2,
      "In Progress": 3,
      Completed: 4,
    };

    return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
  });

  const [todayBookingSearch, setTodayBookingSearch] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTodayBookingSearch(e.target.value);
  };

  const filteredBookings = sortedBookings.filter((booking) => {
    const searchTerm = todayBookingSearch.toLowerCase();

    return (
      booking.tour.title.toLowerCase().includes(searchTerm) ||
      booking.user.name.toLowerCase().includes(searchTerm) ||
      booking.numberOfPeople.toString().includes(searchTerm) ||
      booking.tour.time.includes(searchTerm)
    );
  });

  return (
    <div className="">
      <div className="flex items-center justify-between ">
        <h2 className="t-bookings__heading text-base  mt-4 mb-6 font-semibold">
          All Today's Bookings
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
          <span>Filter1</span>
          <span>Filter2</span>
          <span>Filter3</span>
        </div>
      </div>

      <ul className="flex flex-col gap-4 text-xs ">
        <li className="font-semibold cursor-pointer flex justify-between w-full border border-lightGray rounded-md py-2  items-center">
          <span className="flex-1">Tour name</span>
          <span className="flex-1">Customer name</span>
          <span className="flex-1">Tour time</span>
          <span className="flex-1">Number of people</span>
          <span className="flex-1">Status</span>
        </li>
        {filteredBookings.map((booking) => (
          <li key={booking.bookingId}>
            <Link
              className="cursor-pointer flex justify-between w-full border border-lightGray rounded-md py-2 items-center"
              to="/"
            >
              <span className="flex-1">{booking.tour.title}</span>
              <span className="flex-1">{booking.user.name}</span>
              <span className="flex-1">{booking.tour.time}</span>
              <span className="flex-1">{booking.numberOfPeople}</span>
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
