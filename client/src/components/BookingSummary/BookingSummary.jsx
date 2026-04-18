import "./BookingSummary.scss";
import { formatCurrency } from "../../utils/formatCurrency";

const BookingSummary = ({ quote, quoteLoading, quoteError, onRetry }) => {
  const currency = quote?.currency ?? "USD";

  if (quoteLoading) {
    return (
      <div className="cart-product">
        <h2 className="cart-product__heading">Order Summary</h2>
        <div className="cart-product__loading">
          <div className="cart-product__skeleton" />
          <div className="cart-product__skeleton cart-product__skeleton--short" />
          <div className="cart-product__skeleton" />
        </div>
      </div>
    );
  }

  if (quoteError) {
    return (
      <div className="cart-product">
        <h2 className="cart-product__heading">Order Summary</h2>
        <div className="cart-product__error">
          <p>{quoteError}</p>
          <button className="cart-product__retry" onClick={onRetry}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!quote) return null;

  return (
    <div className="cart-product">
      <h2 className="cart-product__heading">Order Summary</h2>

      <ul className="cart-product__list">
        {quote.breakdown.map((item, i) => (
          <li key={i} className="cart-product__item">
            <div className="cart-product__title">{item.tour_name}</div>
            <div className="cart-product__details">
              <p>
                Adults: {item.guests.adults} ×{" "}
                {formatCurrency(item.base_price, currency)} ={" "}
                {formatCurrency(item.adult_total, currency)}
              </p>

              {item.guests.children > 0 && (
                <p>
                  Children: {item.guests.children} ×{" "}
                  {formatCurrency(item.base_price * 0.5, currency)} ={" "}
                  {formatCurrency(item.child_total, currency)}
                </p>
              )}

              {item.guests.infants > 0 && (
                <p>
                  Infants: {item.guests.infants} × {formatCurrency(0, currency)}
                </p>
              )}

              {item.featured && (
                <p className="cart-product__discount">
                  Featured Discount: -{formatCurrency(item.discount, currency)}
                </p>
              )}

              <p className="cart-product__subtotal">
                <strong>
                  Subtotal: {formatCurrency(item.subtotal, currency)}
                </strong>
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="cart__fees">
        <h4>Additional fees</h4>
        <span>{formatCurrency(0, currency)}</span>
      </div>

      <div className="cart__total">
        <h4>Total</h4>
        <strong>{formatCurrency(quote.grand_total, currency)}</strong>
      </div>
    </div>
  );
};

export default BookingSummary;
