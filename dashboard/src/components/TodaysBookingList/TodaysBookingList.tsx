import "./TodaysBookingList.scss";
import bookingsData from "../../data/todaysBookings.json";
import { Link } from "react-router-dom";

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

  return (
    <div>
      <h2 className="t-bookings__heading">All Today's Bookings</h2>
      <input placeholder="Search" />
      <ul className="t-bookings__list">
        <li className="t-bookings__item t-bookings__item--title">
          <span className="t-bookings__item-content">Tour name</span>
          <span className="t-bookings__item-content">Customer name</span>
          <span className="t-bookings__item-content">Tour time</span>
          <span className="t-bookings__item-content">Number of people</span>
          <span className="t-bookings__item-content">Status</span>
        </li>
        {sortedBookings.map((booking) => (
          <li key={booking.bookingId}>
            <Link className="t-bookings__item" to="/">
              <span className="t-bookings__item-content">
                {booking.tour.title}
              </span>
              <span className="t-bookings__item-content">
                {booking.user.name}
              </span>
              <span className="t-bookings__item-content">
                {booking.tour.time}
              </span>
              <span className="t-bookings__item-content">
                {booking.numberOfPeople}
              </span>
              <div className="t-bookings__item-content t-bookings__status-wrp">
                <span
                  className={`t-bookings__status t-bookings__status--${booking.status
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
