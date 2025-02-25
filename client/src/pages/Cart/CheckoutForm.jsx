import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Fragment, useState } from "react";
import { useDispatch } from "react-redux";
import { clearCart } from "../../features/cart/cartSlice";
import Button from "../../components/Button/Button";
import "./CheckoutForm.scss";

const CheckoutForm = ({ bookings, user, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const dispatch = useDispatch();

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!bookings.length) return alert("Your cart is empty!");

    if (!user)
      return alert("You need to be logged in to proceed with the booking!");

    setLoading(true);
    setError(null);

    try {
      if (!clientSecret) {
        alert("Error: Payment session expired. Please refresh.");
        return;
      }
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/success` },
        redirect: "if_required",
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        dispatch(clearCart());
        alert("Payment successful! Your booking is confirmed.");
        setSuccess(true);
        window.location.href = "/success";
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      {success && (
        <p className="success-message">
          🎉 Payment successful! Your booking is confirmed.
        </p>
      )}

      <form onSubmit={handlePayment}>
        <PaymentElement />
        {error && <p className="error">{error}</p>}
        <Button
          className="btn btn--book"
          type="submit"
          disabled={!stripe || loading}
        >
          {loading ? "Processing..." : "Pay Now"}
        </Button>
      </form>
    </Fragment>
  );
};

export default CheckoutForm;
