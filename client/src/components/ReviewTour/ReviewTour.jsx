import "./ReviewTour.scss";
import { useState } from "react";
import { API_URL } from "../../utils/api";
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
      <ul className="review-tour__list">
        {bookings.map((booking, i) => (
          <li key={booking.id} className="review-tour__item">
            <h2 className="review-details__heading">{bookings[i].title}</h2>

            <div className="review-details">
              <div className="review-details__img">
                <img src={`${API_URL}/${bookings[i].mainImage}`} alt="kkj" />
              </div>
              <div className="review-details__fields">
                <div className="review-details__item">
                  <div className="review-details__field">
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
                  <div className="review-details__field">
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
                  <div className="review-details__field">
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
            </div>

            <button
              className="btn btn--remove-booking"
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
