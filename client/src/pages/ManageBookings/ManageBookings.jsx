import "./ManageBookings.scss";
import axios from "axios";
import { useState, useEffect } from "react";
import Button from "../../components/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import BookingStatus from "../../components/BookingStatus/BookingStatus";

function ManageBookings() {
  const API_URL = import.meta.env.VITE_API_KEY;
  const dispatch = useDispatch();
  const [failedAuth, setFailedAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  const fetchBookings = async (userId, token) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/bookings?userId=${userId}`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      setBookings(response.data);
    } catch (error) {
      console.error(error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (!user || !token) {
      return setFailedAuth(true);
    }

    if (user.id && token) {
      fetchBookings(user.id, token);
    }
  }, [user, token]);

  if (failedAuth) {
    return (
      <main className="dashboard dashboard--not-logged">
        <h1 className="">You must be logged in to see this page.</h1>
        <p>
          <Button className="btn btn--login" to="/login">
            Log in
          </Button>
        </p>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="dashboard">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <h1 className="dashboard__title">
        Welcome back, {user.first_name} {user.last_name}
      </h1>

      {bookings.length > 0 ? (
        <div>
          <h2 className="bookings-heading">My Bookings:</h2>

          <ul className="bookings-list">
            {bookings.map((booking) => (
              <li className="bookings-list-item" key={booking.id}>
                <div className="booking-card-img">
                  <img
                    src={`${API_URL}/${booking.tour_images[0]}`}
                    alt="tour thumbnail"
                  />
                </div>

                <div className="bookings-details">
                  <div>
                    <h2 className="bookings-tour-title">
                      Tour: {booking.tour_title}
                    </h2>
                  </div>
                  <div className="booking-price">
                    Total price: USD {booking.tour_price * 3}
                  </div>
                  <div className="booking-date">
                    Tour Date:{" "}
                    {new Date(booking.booking_date).toLocaleDateString()}
                  </div>
                  <div className="booking-people">
                    Number of Guests:
                    <span> Adults: {booking.adults}</span>
                    {booking.children > 0 && (
                      <span>Children: {booking.children}</span>
                    )}
                    {booking.infants > 0 && (
                      <span>Infants: {booking.infants}</span>
                    )}
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
