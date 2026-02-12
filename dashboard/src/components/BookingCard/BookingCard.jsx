import { Link } from "react-router-dom";
import "./BookingCard.css";

const BookingCard = ({ booking }) => {
  console.log("One booking", booking);
  return (
    <Link to="/bookings/1" className="booking">
      <span className="booking__status">{booking.status}</span>
      <span className="booking__tour-name">
        {booking.primary_contact_name || "Unnamed Contact"}
      </span>
      <span className="booking__tour-date">{booking.booking_date}</span>
    </Link>
  );
};

export default BookingCard;
