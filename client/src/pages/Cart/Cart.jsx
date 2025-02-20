import "./Cart.scss";
import ProductSummary from "../../components/ProductSummary/ProductSummary";
import ReviewTour from "../../components/ReviewTour/ReviewTour";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "../../components/CheckoutForm/CheckoutForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

import { clearCart } from "../../features/cart/cartSlice";
import { useEffect, useState } from "react";

const Cart = () => {
  const API_URL = import.meta.env.VITE_API_KEY;
  const [user, setUser] = useState(null);
  const bookings = useSelector((state) => state.cart.bookings);
  const dispatch = useDispatch();

  const decodeJWT = (token) => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
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

  console.log("Bookings %%%:", bookings, "user%", user);

  // const handleCheckout = async () => {
  //   if (!bookings || bookings.length === 0) {
  //     alert("Your cart is empty!");
  //     return;
  //   }
  //   if (!user) {
  //     alert("You need to be logged in to proceed with the booking!");
  //     return;
  //   }

  //   try {
  //     const bookingRequests = bookings.map((booking) => ({
  //       user_id: user.id,
  //       tour_id: booking.tour_id,
  //       time_slot_id: booking.timeSlot.id,
  //       booking_date: booking.date,
  //       adults: booking.guests.adults,
  //       children: booking.guests.children,
  //       infants: booking.guests.infants,
  //       mainImage: booking.mainImage,
  //       price: booking.price,
  //       title: booking.title,
  //     }));

  //     console.log("Booking requests:", bookingRequests);

  //     const stripe = await stripePromise;
  //     const totalAmount = calculateTotal();

  //     const response = await axios.post(
  //       `${API_URL}/api/payment/create-checkout-session`,
  //       { bookings: bookingRequests, totalAmount }
  //     );

  //     const { id } = response.data;
  //     const result = await stripe.redirectToCheckout({ sessionId: id });

  //     if (result.error) {
  //       console.error(result.error);
  //       alert("Payment failed. Please try again.");
  //       return;
  //     }

  //     dispatch(clearCart());
  //     alert("Your booking has been confirmed!");
  //   } catch (error) {
  //     console.error("Error during checkout process:", error);
  //     alert("Failed to process booking. Please try again.");
  //   }
  // };

  return (
    <div className="cart">
      <h1 className="cart-heading">Cart</h1>
      <div className="cart-list">
        {bookings.length === 0 ? (
          <p className="cart__heading">Your cart is empty.</p>
        ) : (
          <div className="cart__review">
            <ReviewTour bookings={bookings} />
            <ProductSummary
              bookings={bookings}
              // handleCheckout={handleCheckout}
              totalPrice={calculateTotal()}
            />
            <Elements stripe={stripePromise}>
              <CheckoutForm
                bookings={bookings}
                user={user}
                apiUrl={API_URL}
                clearCart={clearCart}
              />
            </Elements>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
