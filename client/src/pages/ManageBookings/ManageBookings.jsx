import "./ManageBookings.scss";
import axios from "axios";
import { useState, useEffect } from "react";
import Button from "../../components/Button/Button";
import { useSelector } from "react-redux";
import BookingStatus from "../../components/BookingStatus/BookingStatus";
import { useRequireAuth } from "../../hooks/useRequireAuth";

function ManageBookings() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const user = useSelector((state) => state.auth.user);
  const { session, isChecking } = useRequireAuth();

  useEffect(() => {
    if (!session || !user) return;
    fetchBookings(user.id, session.access_token);
  }, [session, user]);

  const fetchBookings = async (userId, token) => {
    try {
      const response = await axios.get(`${API_URL}/api/client/bookings`, {
        params: { userId },
        headers: { Authorization: "Bearer " + token },
      });
      setBookings(response.data);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  if (isChecking || (isLoading && session)) {
    return (
      <main className="dashboard">
        <p className="loading">Loading...</p>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <h1 className="dashboard__title">
        Welcome back, {user?.first_name} {user?.last_name}
      </h1>
      {bookings.length > 0 ? (
        <div>
          <h2 className="bookings-heading">My Bookings:</h2>
          <ul className="bookings-list">
            {bookings.map((booking) => (
              <li className="bookings-list-item" key={booking.id}>
                <div className="booking-card-img">
                  <img
                    src={
                      booking.tour_images[0]?.startsWith("http")
                        ? booking.tour_images[0]
                        : `${API_URL}/${booking.tour_images[0]}`
                    }
                    alt="tour thumbnail"
                  />
                </div>
                <div className="bookings-details">
                  <h2 className="bookings-tour-title">{booking.tour_title}</h2>
                  <div className="booking-ref">
                    Ref: {booking.booking_reference}
                  </div>
                  <div className="booking-date">
                    Tour Date:{" "}
                    {new Date(booking.tour_date).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <div className="booking-time">
                    Time: {booking.display_start_time?.slice(0, 5)}
                    {booking.display_end_time &&
                      ` – ${booking.display_end_time.slice(0, 5)}`}
                  </div>
                  <div className="booking-guests">
                    Guests: {booking.total_guests}
                  </div>
                  <div className="booking-price">
                    Total:{" "}
                    {booking.total_price
                      ? `€${parseFloat(booking.total_price).toFixed(2)}`
                      : "—"}
                  </div>
                  <div className="booking-paid">
                    Paid: €{parseFloat(booking.amount_paid ?? 0).toFixed(2)}
                  </div>
                </div>
                <div className="booking-actions">
                  <BookingStatus status={booking.status} />
                  <Button className="btn--get-prepared">Get prepared</Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="booking-message">No bookings yet</p>
      )}
    </main>
  );
}

export default ManageBookings;
