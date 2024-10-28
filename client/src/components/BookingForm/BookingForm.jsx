import axios from "axios";
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

const BookingForm = ({ tour_id, available_dates, title, mainImage }) => {
  const API_URL = import.meta.env.VITE_API_KEY;

  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false);

  const [selectedDate, setSelectedDate] = useState(null);
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

  const calculateTotalPrice = (adults, children, infants) => {
    const adultPrice = 100;
    const childPrice = 50;
    const infantPrice = 0;
    return adults * adultPrice + children * childPrice + infants * infantPrice;
  };

  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  console.log(mainImage);
  const handleAddToCart = () => {
    const booking = {
      id: uuidv4(),
      tour_id: tour_id,
      title,
      mainImage,
      date: formatDate(selectedDate),
      guests: adults + children + infants,
      price: calculateTotalPrice(adults, children, infants),
    };
    console.log("Booking before dispatch:", booking);
    dispatch(addBooking(booking));
  };

  useEffect(() => {
    console.log("Updated cart bookings:", bookings);
  }, [bookings]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const bookingData = {
      user_id: 1,
      tour_id: Number(tour_id),
      number_of_people: adults + children + infants,
      booking_date: formatDate(selectedDate),
    };
    console.log(bookingData);
    try {
      const response = await axios.post(
        `${API_URL}/api/bookings`,

        bookingData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Booking successfully created:", response.data);
      handleAddToCart();
      console.log(bookingData);
      navigate("/cart");
    } catch (error) {
      console.error(
        "Error creating booking:",
        error.response?.data || error.message
      );
    }
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
        <Button type="submit" className=" btn btn--book">
          Add to cart
        </Button>
      </form>
    </div>
  );
};

export default BookingForm;
