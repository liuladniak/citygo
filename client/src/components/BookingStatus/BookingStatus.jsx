// BookingStatus.jsx
import React from "react";
import "./BookingStatus.scss";

const BookingStatus = ({ status }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "booking-status--pending";
      case "confirmed":
        return "booking-status--confirmed";
      case "denied":
        return "booking-status--denied";
      default:
        return "";
    }
  };

  return (
    <div className={`booking-status ${getStatusClass(status)}`}>
      <div className="booking-status__dot"></div>
      {status}
    </div>
  );
};

export default BookingStatus;
