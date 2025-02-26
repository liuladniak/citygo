import React, { useState } from "react";
import TourDatePicker from "../TourDatePicker/TourDatePicker";
import Button from "../Button/Button";

const EditDateModal = ({ booking, onUpdate, onClose }) => {
  const [newDate, setNewDate] = useState(booking.date);
  console.log("edit Date modal booking", booking);
  const handleDateSelected = (date) => {
    setNewDate(date);
  };

  const handleSubmit = () => {
    const updatedBooking = {
      ...booking,
      date: newDate.toISOString().split("T")[0],
    };
    onUpdate(updatedBooking);
    onClose();
  };

  return (
    <div className="modal-content">
      <h3>Edit Date</h3>
      <TourDatePicker
        availableStartDate={booking.availableStartDate}
        availableEndDate={booking.availableEndDate}
        onDateSelected={handleDateSelected}
        selectedDate={newDate}
        unavailableDates={booking.unavailableDates}
        unavailableRecurringDays={booking.unavailableRecurringDays}
      />{" "}
      <div className="modal-actions">
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Save</Button>
      </div>
    </div>
  );
};

export default EditDateModal;
