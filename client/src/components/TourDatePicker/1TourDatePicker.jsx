import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./TourDatePicker.scss";
import useComponentVisible from "../../hooks/useComponentVisible";
import closeIcon from "../../assets/icons/close.svg";

const TourDatePicker = ({ availableDates, onDateSelected }) => {
  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [parsedDates, setParsedDates] = useState([]);

  useEffect(() => {
    const dates = availableDates.map((date) => date.split("T")[0]);
    setParsedDates(dates);
  }, [availableDates]);

  const handleDateClick = (event) => {
    const dayElement = event.target.closest(".react-datepicker__day");
    if (dayElement) {
      const rect = dayElement.getBoundingClientRect();
      const { top, left, width } = rect;
      setPopupPosition({
        top: top + dayElement.offsetHeight,
        left: left + width / 2,
      });
      setIsComponentVisible(true);
    }
  };

  const isDateAvailable = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    return parsedDates.includes(formattedDate);
  };

  const handleDateChange = (date) => {
    if (isDateAvailable(date)) {
      setSelectedDate(date);
      onDateSelected(date);
      setIsComponentVisible(false);
    } else {
      setSelectedDate(date);
      setIsComponentVisible(true);
    }
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="tour-date-picker">
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        onClick={handleDateClick}
        filterDate={(date) => !isPastDate(date)}
        dayClassName={(date) =>
          isPastDate(date)
            ? "react-datepicker__day--past"
            : isDateAvailable(date)
            ? "react-datepicker__day--available"
            : ""
        }
        inline
      />
      {isComponentVisible && (
        <div
          className="popup"
          ref={ref}
          style={{ top: popupPosition.top, left: popupPosition.left }}
        >
          <div className="popup-content">
            <p className="popup-content__date">
              {selectedDate ? selectedDate.toDateString() : ""}
            </p>
            <p>No schedules available for the selected date.</p>
            <button
              className="btn--close"
              type="button"
              onClick={() => setIsComponentVisible(false)}
            >
              <img src={closeIcon} alt="close icon" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourDatePicker;
