import "./ReviewTour.scss";
import { useState } from "react";
import iconEdit from "../../assets/icons/edit.svg";
import { useDispatch } from "react-redux";
import { removeBooking, updateBooking } from "../../features/cart/cartSlice";
import Modal from "../Modal/Modal";
import EditDateModal from "../EditDateModal/EditDateModal";
import EditTimeSlotModal from "../EditTimeSlotModal/EditTimeSlotModal";
import EditGuestsModal from "../EditGuestsModal/EditGuestsModal";
import { Link } from "react-router-dom";
import Button from "../Button/Button";
import { iconDelete } from "../UI/iconsPaths";
import Icon from "../UI/Icon";

const ReviewTour = ({ bookings }) => {
  const dispatch = useDispatch();
  const [editingBooking, setEditingBooking] = useState(null);
  const [editingDetail, setEditingDetail] = useState(null);
  const API_URL = import.meta.env.VITE_API_KEY;

  const handleRemoveBooking = (id) => {
    dispatch(removeBooking(id));
  };

  const handleUpdateBooking = (updatedBooking) => {
    dispatch(updateBooking(updatedBooking));
  };
  console.log("Editing booking", editingBooking);
  return (
    <div className="review-tour">
      <ul className="review-tour__list">
        {bookings.map((booking) => (
          <li key={booking.id} className="review-tour__item">
            <Link to={`/tours/${booking.slug}`}>
              <h2 className="review-details__heading">{booking.title}</h2>
            </Link>

            <div className="review-details">
              <Link
                to={`/tours/${booking.slug}`}
                className="review-details__img"
              >
                <img src={`${API_URL}/${booking.mainImage}`} alt="Tour" />
              </Link>
              <div className="review-details__fields">
                <div className="review-details__item">
                  <div className="review-details__field">
                    <h3 className="review-details__title">Date</h3>
                    <span>{booking.date}</span>
                  </div>
                  <div
                    className="review-details__edit"
                    onClick={() => {
                      setEditingBooking(booking);
                      setEditingDetail("date");
                    }}
                  >
                    <img src={iconEdit} alt="pen icon" />
                    <span>Edit</span>
                  </div>
                </div>

                <div className="review-details__item">
                  <div className="review-details__field">
                    <h3 className="review-details__title">Time</h3>
                    <div className="review-details__time">
                      <span>{booking.timeSlot.start_time}</span>
                      <span>-</span>
                      <span>{booking.timeSlot.end_time}</span>
                    </div>
                  </div>
                  <div
                    className="review-details__edit"
                    onClick={() => {
                      setEditingBooking(booking);
                      setEditingDetail("timeSlot");
                    }}
                  >
                    <img src={iconEdit} alt="pen icon" />
                    <span>Edit</span>
                  </div>
                </div>

                <div className="review-details__item">
                  <div className="review-details__field">
                    <h3 className="review-details__title">Number of guests</h3>
                    <div className="review-details__guests">
                      <span>{booking.guests.adults} Adults</span>
                      <span>, {booking.guests.children} Children</span>
                      <span>, {booking.guests.infants} Infants</span>
                    </div>
                  </div>
                  <div
                    className="review-details__edit"
                    onClick={() => {
                      setEditingBooking(booking);
                      setEditingDetail("guests");
                    }}
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
              <Icon iconPath={iconDelete} />
              Remove from cart
            </button>
          </li>
        ))}
      </ul>

      {editingBooking && editingDetail === "date" && (
        <Modal isOpen={true} onClose={() => setEditingBooking(null)}>
          <EditDateModal
            booking={editingBooking}
            onUpdate={handleUpdateBooking}
            onClose={() => setEditingBooking(null)}
          />
        </Modal>
      )}

      {editingBooking &&
        editingDetail === "timeSlot" &&
        editingBooking.tour_time_slots && (
          <Modal isOpen={true} onClose={() => setEditingBooking(null)}>
            <EditTimeSlotModal
              booking={editingBooking}
              onUpdate={handleUpdateBooking}
              onClose={() => setEditingBooking(null)}
            />
          </Modal>
        )}

      {editingBooking && editingDetail === "guests" && (
        <Modal isOpen={true} onClose={() => setEditingBooking(null)}>
          <EditGuestsModal
            booking={editingBooking}
            onUpdate={handleUpdateBooking}
            onClose={() => setEditingBooking(null)}
          />
        </Modal>
      )}
    </div>
  );
};

export default ReviewTour;
