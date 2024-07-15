import "./ManageBookings.scss";
import axios from "axios";
import { useState, useEffect } from "react";
import Button from "../../components/Button/Button";
import { API_URL } from "../../utils/api";

function ManageBookings() {
  const [failedAuth, setFailedAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);

  const login = async () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      return setFailedAuth(true);
    }

    try {
      const response = await axios.get("http://localhost:8080/auth/profile", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      setUser(response.data);
      fetchBookings(token);
    } catch (error) {
      console.error(error);
      setFailedAuth(true);
      setIsLoading(false);
    }
  };

  const fetchBookings = async (token) => {
    try {
      const response = await axios.get("http://localhost:8080/api/bookings", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      setBookings(response.data);
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
                  Price for 3 people: USD {booking.tour_price * 3}
                </div>
                <div className="booking-date">
                  Tour Date:{" "}
                  {new Date(booking.booking_date).toLocaleDateString()}
                </div>
                <div className="booking-people">
                  Number of People: {booking.number_of_people}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default ManageBookings;
