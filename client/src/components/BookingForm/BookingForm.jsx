import { useState } from "react";
import "./BookingForm.scss";
import TourDatePicker from "../TourDatePicker/TourDatePicker";
import Button from "../Button/Button";
import useComponentVisible from "../../hooks/useComponentVisible";

const BookingForm = ({ tourId, available_dates }) => {
  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const formData = {
    adults,
    children,
    infants,
  };

  const handleDateSelected = (date) => {
    setSelectedDate(date);
  };

  const calculateTotalPrice = () => {
    const adultPrice = 100;
    const childPrice = 50;
    const infantPrice = 0;
    return adults * adultPrice + children * childPrice + infants * infantPrice;
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    const totalPrice = calculateTotalPrice();

    const bookingData = {
      date: selectedDate,
      adults,
      children,
      infants,
      totalPrice,
      tourId,
    };

    console.log(bookingData);
  };

  const totalGuests = adults + children;

  return (
    <div className="booking-form-wrp">
      <h2 className="booking-form__heading">Available dates</h2>
      <TourDatePicker
        availableDates={available_dates}
        onDateSelected={handleDateSelected}
      />
      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="guest-section" ref={ref}>
          <h2 className="guest__heading">Guests joining</h2>
          <div
            className="guests"
            onClick={() => setIsComponentVisible(!isComponentVisible)}
          >
            <p>
              Guests - {totalGuests} {totalGuests === 1 ? "guest" : "guests"},{" "}
              {infants} {infants === 1 ? "infant" : "infants"}
            </p>

            {isComponentVisible && (
              <div className="guest-details">
                <div>
                  <label>Adults:</label>
                  <input
                    type="number"
                    value={adults}
                    onChange={(e) => setAdults(parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </div>
                <div>
                  <label>Children (2-14):</label>
                  <input
                    type="number"
                    value={children}
                    onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div>
                  <label>Infants:</label>
                  <input
                    type="number"
                    value={infants}
                    onChange={(e) => setInfants(parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsComponentVisible(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
        <Button to="/bookings" type="submit" className="btn--book">
          Review booking
        </Button>
      </form>
    </div>
  );
};

export default BookingForm;
