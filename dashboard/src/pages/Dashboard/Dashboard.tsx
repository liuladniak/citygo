// import axios from "axios";
// import { useState, useEffect } from "react";

// const API_URL = import.meta.env.VITE_API_KEY;

// const [bookings, setBookings] = useState<Booking[]>([]);
// const [isLoading, setIsLoading] = useState(true);

// useEffect(() => {
//   const getBookingsData = async () => {
//     try {
//       console.log();
//       const response = await axios.get(`${API_URL}/api/bookings`);
//       const bookings = response.data;
//       setBookings(bookings);
//       setIsLoading(false);
//     } catch (error) {
//       console.error("There was an error fetching the tours data!");
//       setIsLoading(false);
//     }
//   };
//   getBookingsData();
// }, []);

// if (isLoading) {
//   return <div>Loading...</div>;
// }

import "./Dashboard.scss";
import Header from "../../components/Header/Header";
import RevenueAreaChart from "../../components/RevenueAreaChart/RevenueAreaChart";
import TodaysBookingList from "../../components/TodaysBookingList/TodaysBookingList";
import TodayTeam from "../../components/TodayTeam/TodayTeam";
import arrowIcon from "../../assets/icons/arrow-up-right.svg";

const Dashboard = () => {
  return (
    <section className="dashboard">
      <Header pageTitle="Dashboard" />
      <div className="dashboard__layout-split">
        <div className="cards">
          <div className="dashboard__charts">
            <div className="dashboard__chart">
              <RevenueAreaChart />
            </div>
            <div className="dashboard__stats">
              <div className="dashboard__stat">
                <div className=" dashboard__stat--rev">
                  <h3 className="dashboard__stat-name">Total revenue today</h3>
                  <span className="dashboard__stat-value">8,500</span>
                </div>
                <div className="dashboard__stat-link">
                  <img src={arrowIcon} alt="arrow up right icon" />
                </div>
              </div>

              <div className="dashboard__stat dashboard__stat--tours">
                <div className=" dashboard__stat--rev ">
                  <h3 className="dashboard__stat-name">Tours booked today</h3>
                  <span className="dashboard__stat-value">5</span>
                </div>
                <div className="dashboard__stat-link">
                  <img src={arrowIcon} alt="arrow up right icon" />
                </div>
              </div>
            </div>
          </div>

          <TodaysBookingList />
        </div>

        <TodayTeam />
      </div>
    </section>
  );
};

export default Dashboard;
