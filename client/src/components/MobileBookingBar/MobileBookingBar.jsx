import { useState } from "react";
import "./MobileBookingBar.scss";
import BookingForm from "../BookingForm/BookingForm";

const MobileBookingBar = ({
  price,
  slug,
  tour_id,
  title,
  mainImage,
  unavailableRecurringDays,
  unavailableDates,
  tour_time_slots,
  featured,
  bookingWindowMonths,
  selectedCurrency,
  convertPrice,
  discountedPrice,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* sticky bar at bottom of screen */}
      <div className="mobile-booking-bar">
        <div className="mobile-booking-bar__price">
          {featured ? (
            <>
              <span className="mobile-booking-bar__price-old">
                {convertPrice(price)} {selectedCurrency}
              </span>
              <span className="mobile-booking-bar__price-new">
                {discountedPrice} {selectedCurrency}
              </span>
            </>
          ) : (
            <span className="mobile-booking-bar__price-main">
              From {convertPrice(price)} {selectedCurrency}
            </span>
          )}
        </div>
        <button
          className="mobile-booking-bar__btn"
          onClick={() => setIsOpen(true)}
        >
          Book now
        </button>
      </div>

      {/* slide-up panel */}
      {isOpen && (
        <div
          className="mobile-booking-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="mobile-booking-panel">
            <button
              className="mobile-booking-panel__close"
              onClick={() => setIsOpen(false)}
              aria-label="Close booking panel"
            >
              ✕
            </button>
            <BookingForm
              price={price}
              slug={slug}
              tour_id={tour_id}
              title={title}
              mainImage={mainImage}
              unavailableRecurringDays={unavailableRecurringDays}
              unavailableDates={unavailableDates}
              tour_time_slots={tour_time_slots}
              featured={featured}
              bookingWindowMonths={bookingWindowMonths}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBookingBar;
