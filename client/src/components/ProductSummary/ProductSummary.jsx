import Button from "../Button/Button";
import "./ProductSummary.scss";
import { formatCurrency } from "../../utils/formatCurrency";

const ProductSummary = ({ bookings, handleCheckout, totalPrice }) => {
  if (!bookings || bookings.length === 0) {
    return <p>Your cart is empty.</p>;
  }

  return (
    <div className="cart-product">
      <h2 className="cart__heading">Total items</h2>
      <ul className="cart-product__list">
        {bookings.map((booking, i) => (
          <li key={i} className="cart-product__item">
            <div className="cart-product__title">{booking.title}</div>
            <div className="cart-product__price">
              {formatCurrency(booking.price)}
            </div>
          </li>
        ))}
      </ul>
      <div className="cart__subtotal">
        <h4>Subtotal</h4>
        <span>{formatCurrency(totalPrice)}</span>
      </div>
      <div className="cart__fees">
        <h4>Additional fees</h4>
        <span>$0.00</span>
      </div>
      <div className="cart__total">
        <h4>Total</h4>
        <span>{formatCurrency(totalPrice)}</span>
      </div>

      <Button className="btn btn--book" onClick={handleCheckout}>
        Proceed to Checkout
      </Button>
    </div>
  );
};

export default ProductSummary;
