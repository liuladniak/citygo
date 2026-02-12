import React from "react";
import Header from "../../components/Header/Header";
import { Link } from "react-router-dom";

const SingleBooking = () => {
  return (
    <section className="w-full h-full">
      <Header pageTitle="" />
      <Link to="/">Back</Link>
      <p className="">Order details</p>
      <h1 className="header__heading">User Name #Booking Number</h1>
      <div>Booking</div>
      {/* <div>
        <span className="booking__status">{booking.status}</span>
        <span className="booking__tour-name">
          {booking.primary_contact_name || "Unnamed Contact"}
        </span>
        <span className="booking__tour-date">{booking.booking_date}</span>
      </div> */}
    </section>
  );
};

export default SingleBooking;
