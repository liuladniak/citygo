import { Booking } from "@/types/booking";
import BookingCard from "../BookingCard/BookingCard";
import "./BookingsList.css";
type BookingsListProps = {
  bookings: Booking[];
};

const BookingsList = ({ bookings }: BookingsListProps) => {
  console.log("Bookings list:", bookings);
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
