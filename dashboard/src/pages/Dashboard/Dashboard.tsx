import UserNav from "../../components/UserNav/UserNav";
import axios from "axios";
import { useState, useEffect } from "react";
import { API_URL } from "../../utils/api";
import "./Dashboard.scss";

interface Booking {
  tour_id: string;
  tour_name: string;
}

const Dashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getBookingsData = async () => {
      try {
        console.log();
        const response = await axios.get(`${API_URL}/api/bookings`);
        const bookings = response.data;
        setBookings(bookings);
        setIsLoading(false);
      } catch (error) {
        console.error("There was an error fetching the tours data!");
        setIsLoading(false);
      }
    };
    getBookingsData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="dashboard">
      <header className="header">
        <h1 className="heading">Dashboard</h1>
        <UserNav />
      </header>

      <div className="cards">
        <div className="card">Todays schedule</div>
        <div className="card">
          <h2>Today bookings</h2>

          <ul className="bookings-list">
            {bookings.map((booking, i) => (
              <li className="bookings-list__item" key={i}>
                {/* {booking} */} asd
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
