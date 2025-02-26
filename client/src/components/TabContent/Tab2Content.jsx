import "./Tab2Content.scss";
import "./TabContent.scss";

const Tab2Content = ({ bookings }) => {
  const API_URL = import.meta.env.VITE_API_KEY;
  console.log("Account bookings: " + bookings);
  return (
    <div>
      {bookings.length > 0 ? (
        <div>
          <h2 className="bookings-heading">My Bookings:</h2>

          <ul className="bookings-list">
            {bookings.map((booking) => (
              <li className="bookings-list-item" key={booking.id}>
                <div className="booking-card-img">
                  <img
                    src={`${API_URL}/${booking.tour_images[0]}`}
                    alt="tour thumbnail"
                  />
                </div>

                <div className="bookings-details">
                  <div>
                    <h2 className="bookings-tour-title">
                      Tour: {booking.tour_title}
                    </h2>
                  </div>
                  <div className="booking-price">
                    Total price: USD {booking.tour_price * 3}
                  </div>
                  <div className="booking-date">
                    Tour Date:{" "}
                    {new Date(booking.booking_date).toLocaleDateString()}
                  </div>
                  <div className="booking-people">
                    Number of Guests:
                    <span> Adults: {booking.adults}</span>
                    {booking.children > 0 && (
                      <span>Children: {booking.children}</span>
                    )}
                    {booking.infants > 0 && (
                      <span>Infants: {booking.infants}</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="booking-message">No bookings yet</p>
      )}
    </div>
  );
};

export default Tab2Content;
