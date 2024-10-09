import "./ReviewTour.scss";
import { useState } from "react";

import iconEdit from "../../assets/icons/edit.svg";
import { useDispatch } from "react-redux";
// import { RootState } from "../store";
import { removeBooking } from "../../features/cart/cartSlice";
import EditBookingModal from "../EditBookingModal/EditBookingModal";

const ReviewTour = ({ bookings }) => {
  const dispatch = useDispatch();
  const [editingBooking, setEditingBooking] = useState(null);

  const handleRemoveBooking = (id) => {
    dispatch(removeBooking(id));
  };

  return (
    <div className="review-tour">
      <ul>
        {bookings.map((booking) => (
          <li key={booking.id}>
            <div className="review-details">
              <div className="review-details__item">
                <div>
                  <h3 className="review-details__title">Date</h3>
                  <span>{booking.date}</span>
                </div>
                <div
                  className="review-details__edit"
                  onClick={() => setEditingBooking(booking)}
                >
                  <img src={iconEdit} alt="pen icon" />
                  <span>Edit</span>
                </div>
              </div>
              <div className="review-details__item">
                <div>
                  <h3 className="review-details__title">Time</h3>
                  <span>09:00</span>
                </div>
                <div
                  className="review-details__edit"
                  onClick={() => setEditingBooking(booking)}
                >
                  <img src={iconEdit} alt="pen icon" />
                  <span>Edit</span>
                </div>
              </div>
              <div className="review-details__item">
                <div>
                  <h3 className="review-details__title">Number of guests</h3>
                  <span>{booking.guests}</span>
                </div>
                <div
                  className="review-details__edit"
                  onClick={() => setEditingBooking(booking)}
                >
                  <img src={iconEdit} alt="pen icon" />
                  <span>Edit</span>
                </div>
              </div>
            </div>

            <button
              className="btn btn--contact"
              onClick={() => handleRemoveBooking(booking.id)}
            >
              Remove from cart
            </button>
          </li>
        ))}
      </ul>
      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
        />
      )}
    </div>
  );
};

export default ReviewTour;
