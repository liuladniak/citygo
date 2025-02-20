import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import axios from "axios";

const CheckoutForm = ({ bookings, user, apiUrl, clearCart }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    try {
      const bookingRequests = bookings.map((booking) => ({
        user_id: user.id,
        tour_id: booking.tour_id,
        time_slot_id: booking.timeSlot.id,
        booking_date: booking.date,
        adults: booking.guests.adults,
        children: booking.guests.children,
        infants: booking.guests.infants,
        mainImage: booking.mainImage,
        price: booking.price,
        title: booking.title,
      }));

      const totalAmount = bookings.reduce((total, booking) => {
        let totalPrice = booking.guests.adults * booking.price;
        totalPrice += booking.guests.children * (booking.price * 0.5);
        return total + totalPrice;
      }, 0);

      const response = await axios.post(
        `${apiUrl}/api/payment/create-checkout-session`,
        {
          bookings: bookingRequests,
          totalAmount,
        }
      );

      const { id } = response.data;
      const result = await stripe.redirectToCheckout({ sessionId: id });

      if (result.error) {
        console.error(result.error);
        alert("Payment failed. Please try again.");
        return;
      }

      clearCart();
      alert("Your booking has been confirmed!");
    } catch (error) {
      console.error("Error during checkout process:", error);
      alert("Failed to process booking. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe}>
        Pay Now
      </button>
    </form>
  );
};

export default CheckoutForm;
