import { useState } from "react";
import Button from "../Button/Button";
import "./EditGuestsModal.scss";
import Icon from "../UI/Icon";
import { iconAdd, iconRemove } from "../UI/iconsPaths";
const EditGuestsModal = ({ booking, onUpdate, onClose }) => {
  const [adults, setAdults] = useState(booking.guests.adults);
  const [children, setChildren] = useState(booking.guests.children);
  const [infants, setInfants] = useState(booking.guests.infants);

  const handleSubmit = () => {
    const updatedGuests = { adults, children, infants };
    const updatedBooking = { ...booking, guests: updatedGuests };
    onUpdate(updatedBooking);
    onClose();
  };

  return (
    <div className="modal-content">
      <h3>Edit Guests</h3>

      <div className="modal-guest-details">
        <div className="guest-detail  modal-guest-detail">
          <label className="guest-detail-l  modal-guest">Adults:</label>
          <div className="guest-detail-r">
            <button
              className="btn--guests-increment"
              type="button"
              onClick={() => setAdults(adults > 1 ? adults - 1 : 1)}
            >
              <Icon iconPath={iconRemove} className="modal-icon" />
            </button>
            <span className="modal-guest">{adults}</span>
            <button
              className="btn--guests-increment "
              type="button"
              onClick={() => setAdults(adults + 1)}
            >
              <Icon iconPath={iconAdd} className="modal-icon" />
            </button>
          </div>
        </div>
        <div className="guest-detail modal-guest-detail">
          <label className="guest-detail-l modal-guest">Children (2-14):</label>
          <div className="guest-detail-r">
            <button
              className="btn--guests-increment modal-btn--guests-increment"
              type="button"
              onClick={() => setChildren(children > 0 ? children - 1 : 0)}
            >
              <Icon iconPath={iconRemove} className="modal-icon" />
            </button>
            <span className="modal-guest">{children}</span>
            <button
              className="btn--guests-increment"
              type="button"
              onClick={() => setChildren(children + 1)}
            >
              <Icon iconPath={iconAdd} className="modal-icon" />
            </button>
          </div>
        </div>
        <div className="guest-detail modal-guest-detail">
          <label className="guest-detail-l modal-guest">Infants:</label>
          <div className="guest-detail-r">
            <button
              type="button"
              className="btn--guests-increment"
              onClick={() => setInfants(infants > 0 ? infants - 1 : 0)}
            >
              <Icon iconPath={iconRemove} className="modal-icon" />
            </button>
            <span className="modal-guest">{infants}</span>
            <button
              className="btn--guests-increment"
              type="button"
              onClick={() => setInfants(infants + 1)}
            >
              <Icon iconPath={iconAdd} className="modal-icon" />
            </button>
          </div>
        </div>
      </div>

      <div className="modal-actions">
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Save</Button>
      </div>
    </div>
  );
};

export default EditGuestsModal;
