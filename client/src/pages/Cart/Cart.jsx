import "./Cart.scss";
import ReviewTour from "../../components/ReviewTour/ReviewTour";
import { useSelector } from "react-redux";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

import { clearCart } from "../../features/cart/cartSlice";
import { useEffect, useState } from "react";
import axios from "axios";
import BookingSummary from "../../components/BookingSummary/BookingSummary";
import CheckoutForm from "./CheckoutForm";
import { Link } from "react-router-dom";

const Cart = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [user, setUser] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [contactDetails, setContactDetails] = useState({
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    language: "en",
    special_requirements: "",
  });
  const [contactReady, setContactReady] = useState(false);

  const bookings = useSelector((state) => state.cart.bookings);
  const selectedCurrency = useSelector(
    (state) => state.currency.selectedCurrency
  );
  const exchangeRates = useSelector((state) => state.currency.exchangeRates);

  console.log("Bookings in cart from the redux state", bookings);
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = JSON.parse(atob(base64));

      const isExpired = jsonPayload.exp * 1000 < Date.now();
      if (isExpired) {
        localStorage.removeItem("token");
        return null;
      }

      return jsonPayload;
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = decodeJWT(token);
        setUser(decodedToken);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const calculateTotal = () => {
    const exchangeRate =
      selectedCurrency === "USD"
        ? 1
        : exchangeRates[selectedCurrency.toLowerCase()] || 1;

    return bookings.reduce((total, booking) => {
      const { price, guests, featured } = booking;
      let totalPrice = guests.adults * price * exchangeRate;
      totalPrice += guests.children * (price * 0.5 * exchangeRate);
      if (featured) totalPrice *= 0.9;
      return total + totalPrice;
    }, 0);
  };

  const handleContactChange = (e) => {
    setContactDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactDetails.contact_name || !contactDetails.contact_email) return;
    setContactReady(true);
  };

  useEffect(() => {
    if (bookings.length > 0 && user && contactReady && !clientSecret) {
      console.log("Contact details being sent:", contactDetails);
      axios
        .post(`${API_URL}/api/payment/create-payment-intent`, {
          selectedCurrency,
          bookings: bookings.map((booking) => ({
            user_id: user.id,
            tour_id: booking.tour_id,
            time_slot_id: booking.timeSlot.id,
            tour_date: booking.date,
            adults: booking.guests.adults,
            children: booking.guests.children,
            infants: booking.guests.infants,
            contact_name: contactDetails.contact_name,
            contact_email: contactDetails.contact_email,
            contact_phone: contactDetails.contact_phone,
            language: contactDetails.language,
            special_requirements: contactDetails.special_requirements,
          })),
        })
        .then((res) => setClientSecret(res.data.clientSecret))
        .catch((err) => console.error("Error fetching payment intent:", err));
    }
  }, [bookings, clientSecret, user, selectedCurrency, contactReady]);

  console.log("Bookings %%%:", bookings, "user%", user);

  if (bookings.length === 0) {
    return (
      <div className="cart">
        <h1 className="cart-heading">Cart</h1>
        <p className="cart__heading">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="cart">
      <h1 className="cart-heading">Review & Book</h1>
      <div className="cart__layout">
        <div className="cart__left">
          <div className="cart__section">
            <h2 className="cart__section-heading">
              <span className="cart__section-number">1</span>
              Your Trip
            </h2>
            <ReviewTour bookings={bookings} />
          </div>

          <div className="cart__section">
            <h2 className="cart__section-heading">
              <span className="cart__section-number">2</span>
              Your Details
            </h2>

            {!user ? (
              <div className="sign-in-prompt">
                <p>Sign in to complete your booking.</p>
                <Link to="/login" className="sign-in-btn">
                  Sign In
                </Link>
              </div>
            ) : !contactReady ? (
              <div className="contact-form-section">
                <form
                  className="contact-form-cart"
                  onSubmit={handleContactSubmit}
                >
                  <div className="contact-form__row">
                    <div className="contact-field">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="contact_name"
                        value={contactDetails.contact_name}
                        onChange={handleContactChange}
                        placeholder="John Smith"
                        required
                        className="contact-input"
                      />
                    </div>
                    <div className="contact-field">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="contact_email"
                        value={contactDetails.contact_email}
                        onChange={handleContactChange}
                        placeholder="john@example.com"
                        required
                        className="contact-input"
                      />
                    </div>
                  </div>
                  <div className="contact-form__row">
                    <div className="contact-field">
                      <label>Phone (optional)</label>
                      <input
                        type="tel"
                        name="contact_phone"
                        value={contactDetails.contact_phone}
                        onChange={handleContactChange}
                        placeholder="+1 234 567 890"
                        className="contact-input"
                      />
                    </div>
                    <div className="contact-field">
                      <label>Language preference</label>
                      <select
                        name="language"
                        value={contactDetails.language}
                        onChange={handleContactChange}
                        className="contact-input"
                      >
                        <option value="en">English</option>
                        <option value="tr">Turkish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="es">Spanish</option>
                        <option value="ar">Arabic</option>
                      </select>
                    </div>
                  </div>
                  <div className="contact-field">
                    <label>Special requirements (optional)</label>
                    <textarea
                      name="special_requirements"
                      value={contactDetails.special_requirements}
                      onChange={handleContactChange}
                      placeholder="Accessibility needs, dietary requirements..."
                      className="contact-input contact-input--textarea"
                      rows={3}
                    />
                  </div>
                  <button type="submit" className="cart__continue-btn">
                    Continue to Payment →
                  </button>
                </form>
              </div>
            ) : (
              <div className="contact-summary">
                <div className="contact-summary__details">
                  <h3>Contact Details</h3>
                  <p>{contactDetails.contact_name}</p>
                  <p>{contactDetails.contact_email}</p>
                  {contactDetails.contact_phone && (
                    <p>{contactDetails.contact_phone}</p>
                  )}
                </div>
                <button
                  className="btn--edit-contact"
                  onClick={() => {
                    setContactReady(false);
                    setClientSecret(null);
                  }}
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {contactReady && user && (
            <div className="cart__section">
              <h2 className="cart__section-heading">
                <span className="cart__section-number">3</span>
                Payment
              </h2>
              {clientSecret ? (
                <div className="contact-form-section">
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm
                      bookings={bookings}
                      user={user}
                      clearCart={clearCart}
                      clientSecret={clientSecret}
                    />
                  </Elements>
                </div>
              ) : (
                <p className="cart__loading">Loading payment options...</p>
              )}
            </div>
          )}
        </div>

        <div className="cart__right">
          <BookingSummary bookings={bookings} totalPrice={calculateTotal()} />
        </div>
      </div>
    </div>
  );
};

export default Cart;
