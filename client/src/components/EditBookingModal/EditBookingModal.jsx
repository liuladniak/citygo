import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateBooking } from "../../features/cart/cartSlice";
import "./EditBookingModal.scss";

const EditBookingModal = ({ booking, onClose }) => {
  const [editedBooking, setEditedBooking] = useState(booking);
  const dispatch = useDispatch();

  const handleSave = () => {
    dispatch(updateBooking(editedBooking));
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal__content">
        <h2>Edit Booking</h2>
        <div>
          <label>Date</label>
          <input
            type="date"
            value={editedBooking.date}
            onChange={(e) =>
              setEditedBooking({ ...editedBooking, date: e.target.value })
            }
          />
        </div>
        <div>
          <label>Guests</label>
          <input
            type="number"
            value={editedBooking.guests}
            onChange={(e) =>
              setEditedBooking({ ...editedBooking, guests: e.target.value })
            }
          />
        </div>
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default EditBookingModal;
