import React from "react";
import Header from "../../components/Header/Header";
import { Link } from "react-router-dom";
import { CardHeader, CardTitle } from "@/components/ui/card";
import BackButton from "@/components/ui/BackButton";

const SingleBooking = () => {
  return (
    <section className="w-full h-full">
      <CardHeader className="flex items-center">
        <BackButton />
        <CardTitle>Order Details</CardTitle>
      </CardHeader>
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
