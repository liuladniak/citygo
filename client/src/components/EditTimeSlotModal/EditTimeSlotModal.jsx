import { useState } from "react";
import CustomSelect from "../CustomSelect/CustomSelect";
import "./EditTimeSlotModal.scss";
import Button from "../Button/Button";
const EditTimeSlotModal = ({ booking, onUpdate, onClose }) => {
  const timeSlots = booking?.tour_time_slots || [];
  const [newTimeSlot, setNewTimeSlot] = useState(booking?.timeSlot || null);
  console.log("BOOKING IN EDIT TIME SLOTS", booking);
  console.log("Time Slots: ", timeSlots);
  console.log("Current Time Slot: ", newTimeSlot);

  const handleTimeSlotChange = (selectedValue) => {
    console.log("Selected Value:", selectedValue);
    const selectedSlot = timeSlots.find(
      (slot) => slot.id === selectedValue.value
    );
    console.log("Selected Slot:", selectedSlot);
    setNewTimeSlot(selectedSlot);
  };

  const handleSubmit = () => {
    if (!newTimeSlot) {
      alert("Please select a valid time slot.");
      return;
    }
    const updatedBooking = { ...booking, timeSlot: newTimeSlot };
    onUpdate(updatedBooking);
    onClose();
  };

  const timeSlotOptions = timeSlots.map((slot) => ({
    value: slot.id,
    label: `${slot.start_time} - ${slot.end_time}`,
  }));

  console.log("Time Slot Options: ", timeSlotOptions);

  return (
    <div className="modal-content">
      <h3>Edit Time Slot</h3>
      {timeSlots.length > 0 ? (
        <div className="modal-select">
          <CustomSelect
            options={timeSlotOptions}
            // value={newTimeSlot?.id || ""}
            value={timeSlotOptions.find(
              (option) => option.value === newTimeSlot?.id
            )}
            onChange={handleTimeSlotChange}
            placeholder="Select Time Slot"
            hidePlaceholder={true}
            className="modal-select-time-slot"
          />{" "}
        </div>
      ) : (
        <p>No time slots available for this tour.</p>
      )}
      <div className="modal-actions">
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Save</Button>
      </div>
    </div>
  );
};

export default EditTimeSlotModal;
