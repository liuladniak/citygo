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

import "./Dashboard.css";
import Header from "../../components/Header/Header";

import TodaysBookingList from "../../components/TodaysBookingList/TodaysBookingList";
import TodayTeam from "../../components/TodayTeam/TodayTeam";
import arrowIcon from "../../assets/icons/arrow-up-right.svg";
import weatherWidget from "../../assets/images/Screenshot 2024-11-24 at 11.08.03 PM.png";
const Dashboard = () => {
  return (
    <section className="w-full h-full">
      <Header pageTitle="Dashboard" />
      <div className="flex justify-between">
        <div className="flex flex-col gap-10 mt-8 flex-3 p-4">
          <div className="flex gap-10">
            <div className="flex gap-10">
              <div className="dashboard__stat flex items-end border border-blue-200  p-4 w-48 h-28 rounded-2xl">
                <div className="dashboard__stat--rev flex flex-col justify-between gap-5 w-full h-full">
                  <h3 className="text-sm">Total revenue today</h3>
                  <span className="text-2xl">8,500</span>
                </div>
                <div className="w-8 h-8">
                  <img src={arrowIcon} alt="arrow up right icon" />
                </div>
              </div>

              <div className="bg-gradient-to-b from-violet-200 to-transparent flex items-end border border-blue-200  p-4 w-48 h-28 rounded-2xl">
                <div className="flex flex-col justify-between gap-5 w-full h-full">
                  <h3 className="text-sm">Tours booked today</h3>
                  <span className="text-2xl">5</span>
                </div>
                <div className="w-8 h-8">
                  <img src={arrowIcon} alt="arrow up right icon" />
                </div>
              </div>
            </div>
          </div>

          <TodaysBookingList />
        </div>
        <div className="flex flex-col gap-6 flex-1 p-4">
          <div className="h-40">
            <h3>Weather</h3>
            <img
              src={weatherWidget}
              alt="weather"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full h-80 bg-blue-200 rounded-md p-4">
            <h3 className="text-xl text-center">Calender</h3>
          </div>
          <TodayTeam />
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
