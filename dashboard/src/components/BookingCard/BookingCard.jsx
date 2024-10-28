import "./BookingCard.scss";

const BookingCard = ({ booking }) => {
  return (
    <div className="booking">
      <span className="booking__status">{booking.status}</span>
      <span className="booking__customer-name">{booking.customerName}</span>
      <span className="booking__tour-name">{booking.tourName}</span>
      <span className="booking__tour-date">{booking.tourDate}</span>
    </div>
  );
};

export default BookingCard;
