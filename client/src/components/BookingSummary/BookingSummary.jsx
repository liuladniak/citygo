import "./BookingSummary.scss";
import { formatCurrency } from "../../utils/formatCurrency";

const BookingSummary = ({ totalPrice, bookings }) => {
  console.log("Bookings summary component bookings", bookings);

  console.log("Total tour price", totalPrice);
  return (
    <div className="cart-product">
      <h2 className="cart__heading">Total</h2>
      <ul className="cart-product__list">
        {/* {bookings.map((booking, i) => (
          <li key={i} className="cart-product__item">
            <div className="cart-product__title">{booking.title}</div>
            <div className="cart-product__price">
              $ {booking.featured ? booking.price * 0.9 : booking.price}
            </div>
          </li>
        ))} */}

        {bookings.map((booking, i) => {
          const { title, price, guests, featured } = booking;

          const adultTotal = guests.adults * price;
          const childTotal = guests.children
            ? guests.children * (price * 0.5)
            : 0;
          const infantTotal = guests.infants ? guests.infants * 0 : 0;
          let totalTourPrice = adultTotal + childTotal + infantTotal;

          if (featured) {
            totalTourPrice *= 0.9;
          }

          return (
            <li key={i} className="cart-product__item">
              <div className="cart-product__title">
                <strong>{title}</strong>
              </div>
              <div className="cart-product__details">
                <p>
                  Adults: {guests.adults} × {formatCurrency(price)} ={" "}
                  {formatCurrency(adultTotal)}
                </p>
                {guests.children > 0 && (
                  <p>
                    Children: {guests.children} × {formatCurrency(price * 0.5)}{" "}
                    = {formatCurrency(childTotal)}
                  </p>
                )}

                {guests.infants > 0 && (
                  <p>
                    Infants: {guests.infants} × $0.00 ={" "}
                    {formatCurrency(infantTotal)}
                  </p>
                )}
                {featured && (
                  <p className="cart-product__discount">
                    Featured Discount: -10%
                  </p>
                )}
                <p className="cart-product__subtotal">
                  <strong>Subtotal: {formatCurrency(totalTourPrice)}</strong>
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="cart__fees">
        <h4>Additional fees</h4>
        <span>$0.00</span>
      </div>
      <div className="cart__total">
        <h4>Total</h4>
        <p>
          {" "}
          <strong>{formatCurrency(totalPrice)}</strong>
        </p>
      </div>
    </div>
  );
};

export default BookingSummary;
