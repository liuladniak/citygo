import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BookingForm.scss";
import TourDatePicker from "../TourDatePicker/TourDatePicker";
import Button from "../Button/Button";
import useComponentVisible from "../../hooks/useComponentVisible";
import calendarIcon from "../../assets/icons/calendar.svg";

import { useDispatch, useSelector } from "react-redux";
import { addBooking } from "../../features/cart/cartSlice";
import { v4 as uuidv4 } from "uuid";
import CustomSelect from "../CustomSelect/CustomSelect";

const BookingForm = ({
  price,
  slug,
  tour_id,
  availableStartDate,
  availableEndDate,
  title,
  mainImage,
  unavailableRecurringDays,
  unavailableDates,
  tour_time_slots = [],
}) => {
  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(
    tour_time_slots.length > 0 ? tour_time_slots[0] : null
  );
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const bookings = useSelector((state) => state.cart.bookings);

  const toggleDropdown = () => {
    setIsComponentVisible(!isComponentVisible);
  };

  const handleDateSelected = (date) => {
    console.log(date);
    setSelectedDate(date);
  };

  const handleTimeSlotChange = (selectedId) => {
    const selectedSlot = tour_time_slots.find((slot) => slot.id === selectedId);
    if (selectedSlot) {
      setSelectedTimeSlot(selectedSlot);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const handleAddToCart = () => {
    const booking = {
      id: uuidv4(),
      tour_id: tour_id,
      title,
      mainImage,
      date: formatDate(selectedDate),
      timeSlot: selectedTimeSlot,
      tour_time_slots,
      slug,
      availableStartDate,
      availableEndDate,
      unavailableRecurringDays,
      unavailableDates,
      guests: {
        adults,
        children,
        infants,
      },
      price,
    };
    console.log("Booking before dispatch in Booking form:", booking);
    dispatch(addBooking(booking));

    navigate("/cart");
  };

  useEffect(() => {
    console.log("Updated cart bookings:", bookings);
  }, [bookings]);

  const totalGuests = adults + children;

  const timeSlotOptions = tour_time_slots.map(
    (slot) => `${slot.start_time} - ${slot.end_time}`
  );
  console.log(timeSlotOptions);

  console.log("TIME slot options", timeSlotOptions);
  return (
    <div className="booking-form-wrp">
      <div className="booking-form__heading-wrp">
        <h2 className="booking-form__heading">Available dates</h2>
        <img src={calendarIcon} alt="calendar icon" />
      </div>
      <TourDatePicker
        availableStartDate={availableStartDate}
        availableEndDate={availableEndDate}
        onDateSelected={handleDateSelected}
        unavailableDates={unavailableDates}
        unavailableRecurringDays={unavailableRecurringDays}
      />
      <form className="booking-form">
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
        <CustomSelect
          value={selectedTimeSlot?.id}
          placeholder="Select Time Slot"
          hidePlaceholder={true}
          options={timeSlotOptions}
          onChange={handleTimeSlotChange}
        />
        <Button
          type="button"
          onClick={handleAddToCart}
          className=" btn btn--book"
        >
          Add to cart
        </Button>
      </form>
    </div>
  );
};

export default BookingForm;
