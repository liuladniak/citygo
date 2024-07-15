import { useState } from "react";
import "./BookingForm.scss";
import TourDatePicker from "../TourDatePicker/TourDatePicker";
import Button from "../Button/Button";
import useComponentVisible from "../../hooks/useComponentVisible";
import calendarIcon from "../../assets/icons/calendar.svg";

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

  const toggleDropdown = () => {
    setIsComponentVisible(!isComponentVisible);
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
  };

  const totalGuests = adults + children;

  return (
    <div className="booking-form-wrp">
      <div className="booking-form__heading-wrp">
        <h2 className="booking-form__heading">Available dates</h2>
        <img src={calendarIcon} alt="calendar icon" />
      </div>
      <TourDatePicker
        availableDates={available_dates}
        onDateSelected={handleDateSelected}
      />
      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="guest-section" ref={ref}>
          <h2 className="guest__heading">Guests joining</h2>
          <div className="guests">
            <p onClick={toggleDropdown}>
              Guests - {totalGuests} {totalGuests === 1 ? "guest" : "guests"},{" "}
              {infants} {infants === 1 ? "infant" : "infants"}
            </p>

            {isComponentVisible && (
              <div className="guest-details">
                <div className="guest-detail">
                  <label className="guest-detail-l">Adults:</label>
                  <div className="guest-detail-r">
                    <button
                      className="btn--guests-increment"
                      type="button"
                      onClick={() => setAdults(adults > 1 ? adults - 1 : 1)}
                    >
                      -
                    </button>
                    <span>{adults}</span>
                    <button
                      className="btn--guests-increment"
                      type="button"
                      onClick={() => setAdults(adults + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="guest-detail">
                  <label className="guest-detail-l">Children (2-14):</label>
                  <div className="guest-detail-r">
                    <button
                      className="btn--guests-increment"
                      type="button"
                      onClick={() =>
                        setChildren(children > 0 ? children - 1 : 0)
                      }
                    >
                      -
                    </button>
                    <span>{children}</span>
                    <button
                      className="btn--guests-increment"
                      type="button"
                      onClick={() => setChildren(children + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="guest-detail">
                  <label className="guest-detail-l">Infants:</label>
                  <div className="guest-detail-r">
                    <button
                      type="button"
                      className="btn--guests-increment"
                      onClick={() => setInfants(infants > 0 ? infants - 1 : 0)}
                    >
                      -
                    </button>
                    <span>{infants}</span>
                    <button
                      className="btn--guests-increment"
                      type="button"
                      onClick={() => setInfants(infants + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="btn--guests-close"
                  type="button"
                  onClick={() => setIsComponentVisible(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
        <Button to="/bookings" type="submit" className=" btn btn--book">
          Review booking
        </Button>
      </form>
    </div>
  );
};

export default BookingForm;
