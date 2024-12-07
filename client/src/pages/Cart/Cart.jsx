import { loadStripe } from "@stripe/stripe-js";
import "./Cart.scss";
import ProductSummary from "../../components/ProductSummary/ProductSummary";
import ReviewTour from "../../components/ReviewTour/ReviewTour";
import { useSelector } from "react-redux";
// import { RootState } from "../store";

const Cart = () => {
  // const bookings = useSelector((state: RootState) => state.cart.bookings);
  // const totalBookings = useSelector((state: RootState) => state.cart.totalBookings);

  const bookings = useSelector((state) => state.cart.bookings);
  console.log("CART:", bookings);

  const makePayment = async () => {
    const stripe = await loadStripe("");
  };

  return (
    <div className="cart">
      <div>
        {bookings.length === 0 ? (
          <p className="cart__heading">Your cart is empty.</p>
        ) : (
          <div className="cart__review">
            <ReviewTour bookings={bookings} />
            <ProductSummary bookings={bookings} makePayment={makePayment} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
