import { useState, useEffect } from "react";
import { toDateString } from "../../utils/toDateString";
import TourDatePicker from "../TourDatePicker/TourDatePicker";
import Button from "../Button/Button";
import axios from "axios";

const EditDateModal = ({ booking, onUpdate, onClose }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [newDate, setNewDate] = useState(booking.date);
  const [availability, setAvailability] = useState({
    unavailableDates: [],
    unavailableRecurringDays: [],
  });
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/tours/${booking.slug}`,
        );
        setAvailability({
          unavailableDates: [
            ...(data.unavailable_dates ?? []),
            ...(data.agency_unavailable_dates ?? []),
          ],
          unavailableRecurringDays: [
            ...(data.unavailable_recurring_day_of_week ?? []),
            ...(data.agency_recurring_days ?? []),
          ],
        });
      } catch (err) {
        console.error("Failed to fetch availability:", err);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [booking.slug]);

  const handleDateSelected = (date) => setNewDate(date);

  const handleSubmit = () => {
    const updatedBooking = {
      ...booking,
      date: typeof newDate === "string" ? newDate : toDateString(newDate),
    };
    onUpdate(updatedBooking);
    onClose();
  };

  return (
    <div className="modal-content">
      <h3>Edit Date</h3>
      {loadingAvailability ? (
        <p style={{ padding: "1.6rem", fontSize: "1.4rem", color: "#6b7280" }}>
          Loading availability...
        </p>
      ) : (
        <TourDatePicker
          onDateSelected={handleDateSelected}
          selectedDate={newDate}
          unavailableDates={availability.unavailableDates}
          unavailableRecurringDays={availability.unavailableRecurringDays}
        />
      )}
      <div className="modal-actions">
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loadingAvailability}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default EditDateModal;
