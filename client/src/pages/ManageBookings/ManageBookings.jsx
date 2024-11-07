import "./ManageBookings.scss";
import axios from "axios";
import { useState, useEffect } from "react";
import Button from "../../components/Button/Button";

function ManageBookings() {
  const API_URL = import.meta.env.VITE_API_KEY;

  const [failedAuth, setFailedAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);

  console.log("BOOKINGS:", bookings);
  const login = async () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      return setFailedAuth(true);
    }

    try {
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      setUser(response.data);
      fetchBookings(response.data.id, token);
    } catch (error) {
      console.error(error);
      setFailedAuth(true);
      setIsLoading(false);
    }
  };

  const fetchBookings = async (userId, token) => {
    try {
      console.log("User ID being sent:", userId);
      const response = await axios.get(
        `${API_URL}/api/bookings?userId=${userId}`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      setBookings(response.data);
      console.log("RESPONSE DATA", response.data);
    } catch (error) {
      console.error(error);
    }

    setIsLoading(false);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
    setFailedAuth(true);
  };

  useEffect(() => {
    login();
  }, []);

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
                    Number of Guests: {booking.number_of_people}
                  </div>
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
