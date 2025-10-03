import { Link } from "react-router-dom";
import "./BookingCard.css";

const BookingCard = ({ booking }) => {
  return (
    <Link to="/bookings/1" className="booking">
      <span className="booking__status">{booking.status}</span>
      <span className="booking__customer-name">{booking.customerName}</span>
      <span className="booking__tour-name">{booking.tourName}</span>
      <span className="booking__tour-date">{booking.tourDate}</span>
    </Link>
  );
};

export default BookingCard;
