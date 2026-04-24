import "./Cart.scss";
import ReviewTour from "../../components/ReviewTour/ReviewTour";
import { useSelector } from "react-redux";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { clearCart } from "../../features/cart/cartSlice";
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import BookingSummary from "../../components/BookingSummary/BookingSummary";
import CheckoutForm from "./CheckoutForm";
import { Link } from "react-router-dom";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const API_URL = import.meta.env.VITE_API_URL;

const decodeJWT = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

const Cart = () => {
  const [user, setUser] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState(null);
  const [contactReady, setContactReady] = useState(false);
  const [contactDetails, setContactDetails] = useState({
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    language: "en",
    special_requirements: "",
  });
  const contactDetailsRef = useRef(contactDetails);

  const bookings = useSelector((state) => state.cart.bookings);
  const selectedCurrency = useSelector(
    (state) => state.currency.selectedCurrency
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setUser(decodeJWT(token));
  }, []);

  const fetchQuote = useCallback(async () => {
    if (bookings.length === 0) return;
    setQuoteLoading(true);
    setQuoteError(null);
    try {
      const { data } = await axios.post(`${API_URL}/api/payment/cart/quote`, {
        selectedCurrency,
        bookings: bookings.map((b) => ({
          tour_id: b.tour_id,
          adults: b.guests.adults,
          children: b.guests.children,
          infants: b.guests.infants,
        })),
      });
      setQuote(data);
    } catch (err) {
      console.error("Failed to fetch price quote:", err);
      setQuoteError("Unable to load pricing. Please try again.");
    } finally {
      setQuoteLoading(false);
    }
  }, [bookings, selectedCurrency]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  useEffect(() => {
    if (!bookings.length || !user || !contactReady || clientSecret) return;
    const details = contactDetailsRef.current;
    axios
      .post(`${API_URL}/api/payment/create-payment-intent`, {
        selectedCurrency,
        bookings: bookings.map((b) => ({
          user_id: user.id,
          tour_id: b.tour_id,
          time_slot_id: b.timeSlot.id,
          tour_date: b.date,
          adults: b.guests.adults,
          children: b.guests.children,
          infants: b.guests.infants,
          contact_name: details.contact_name,
          contact_email: details.contact_email,
          contact_phone: details.contact_phone,
          language: details.language,
          special_requirements: details.special_requirements,
        })),
      })
      .then((res) => setClientSecret(res.data.clientSecret))
      .catch((err) => console.error("Error creating payment intent:", err));
  }, [bookings, user, contactReady, clientSecret, selectedCurrency]);

  const handleContactChange = (e) => {
    setContactDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactDetails.contact_name || !contactDetails.contact_email) return;
    contactDetailsRef.current = contactDetails;
    setContactReady(true);
  };

  if (bookings.length === 0) {
    return (
      <div className="cart">
        <h1 className="cart-heading">Your Cart</h1>
        <div className="cart__empty">
          <div className="cart__empty-icon">🧳</div>
          <h2 className="cart__empty-title">Your cart is empty</h2>
          <p className="cart__empty-text">
            You haven't added any tours yet. Browse our experiences and start
            planning your Istanbul adventure.
          </p>
          <Link to="/tours" className="cart__empty-btn">
            Explore Tours
          </Link>
        </div>
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
          <BookingSummary
            quote={quote}
            quoteLoading={quoteLoading}
            quoteError={quoteError}
            onRetry={fetchQuote}
          />
        </div>
      </div>
    </div>
  );
};

export default Cart;
