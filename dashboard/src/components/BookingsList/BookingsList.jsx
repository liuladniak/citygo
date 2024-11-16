import BookingCard from "../BookingCard/BookingCard";
import "./BookingsList.css";

const bookings = [
  {
    id: 1,
    customerName: "John Doe",
    tourName: "Bosponsors tour",
    tourDate: "12/11/2024",
    bookingTime: new Date(),
    tourGuide: "Alex Smith",
    status: "upcoming",
  },
  {
    id: 2,
    customerName: "John Doe",
    tourName: "Bosponsors tour",
    tourDate: "12/11/2024",
    bookingTime: new Date(),
    tourGuide: "Alex Smith",
    status: "upcoming",
  },
  {
    id: 3,
    customerName: "John Doe",
    tourName: "Bosponsors tour",
    tourDate: "12/11/2024",
    bookingTime: new Date(),
    tourGuide: "Alex Smith",
    status: "upcoming",
  },
  {
    id: 4,
    customerName: "John Doe",
    tourName: "Bosponsors tour",
    tourDate: "12/11/2024",
    bookingTime: new Date(),
    tourGuide: "Alex Smith",
    status: "upcoming",
  },
];

const BookingsList = () => {
  return (
    <section className="booking-list">
      <div>
        <input
          id="searchBooking"
          type="text"
          placeholder="Search a booking..."
        />
      </div>

      {bookings.map((booking) => {
        return <BookingCard key={booking.id} booking={booking} />;
      })}
    </section>
  );
};

export default BookingsList;
