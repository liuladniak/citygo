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
  const API_URL = import.meta.env.VITE_API_KEY;
  const [user, setUser] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const bookings = useSelector((state) => state.cart.bookings);
  const selectedCurrency = useSelector(
    (state) => state.currency.selectedCurrency
  );
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
    return bookings.reduce((total, booking) => {
      const { price, guests, isFeatured } = booking;
      let totalPrice = 0;

      totalPrice += guests.adults * price;
      totalPrice += guests.children * (price * 0.5);
      totalPrice += guests.infants * 0;

      if (isFeatured) {
        totalPrice *= 0.9;
      }

      return total + totalPrice;
    }, 0);
  };

  useEffect(() => {
    if (bookings.length > 0 && user && !clientSecret) {
      console.log("Booking Payload:", bookings);
      axios
        .post(`${API_URL}/api/payment/create-payment-intent`, {
          selectedCurrency: selectedCurrency,
          bookings: bookings.map((booking) => ({
            user_id: user.id,
            tour_id: booking.tour_id,
            time_slot_id: booking.timeSlot.id,
            booking_date: booking.date,
            adults: booking.guests.adults,
            children: booking.guests.children,
            infants: booking.guests.infants,
          })),
        })
        .then((res) => setClientSecret(res.data.clientSecret))
        .catch((err) => console.error("Error fetching payment intent:", err));
    }
  }, [bookings, clientSecret, user, selectedCurrency]);

  console.log("Bookings %%%:", bookings, "user%", user);

  return (
    <div className="cart">
      <h1 className="cart-heading">Cart</h1>
      <div className="cart-list">
        {bookings.length === 0 ? (
          <p className="cart__heading">Your cart is empty.</p>
        ) : (
          <div className="cart__review">
            <ReviewTour bookings={bookings} />
            <div>
              <BookingSummary
                bookings={bookings}
                totalPrice={calculateTotal()}
              />
              {user ? (
                clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm
                      bookings={bookings}
                      user={user}
                      clearCart={clearCart}
                      totalPrice={calculateTotal()}
                      clientSecret={clientSecret}
                    />
                  </Elements>
                ) : (
                  <p>Loading payment options...</p>
                )
              ) : (
                <div className="sign-in-prompt">
                  <p>You need to sign in to proceed with booking.</p>
                  <Link to="/login" className="sign-in-btn">
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
