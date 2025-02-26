import "./BookingSummary.scss";
import { formatCurrency } from "../../utils/formatCurrency";
import { useSelector } from "react-redux";

const BookingSummary = ({ totalPrice, bookings }) => {
  const selectedCurrency = useSelector(
    (state) => state.currency.selectedCurrency
  );
  console.log("Selected currency: " + selectedCurrency);
  const exchangeRates = useSelector((state) => state.currency.exchangeRates);
  const exchangeRate =
    selectedCurrency === "USD"
      ? 1
      : exchangeRates[selectedCurrency.toLowerCase()] || 1;

  return (
    <div className="cart-product">
      <h2 className="cart__heading">Total</h2>
      <ul className="cart-product__list">
        {bookings.map((booking, i) => {
          const { title, price, guests, featured } = booking;
          const convertedPrice = price * exchangeRate;
          const adultTotal = guests.adults * price * exchangeRate;
          const childTotal = guests.children
            ? guests.children * (price * 0.5 * exchangeRate)
            : 0;
          const infantTotal = guests.infants ? guests.infants * 0 : 0;
          let totalTourPrice = adultTotal + childTotal + infantTotal;

          if (featured) {
            totalTourPrice *= 0.9;
          }
          console.log("Converted Price:", convertedPrice);
          console.log("Adult Total:", adultTotal);
          console.log("Child Total:", childTotal);
          console.log("Total Tour Price:", totalTourPrice);

          return (
            <li key={i} className="cart-product__item">
              <div className="cart-product__title">
                <strong>{title}</strong>
              </div>
              <div className="cart-product__details">
                <p>
                  Adults: {guests.adults} ×{" "}
                  {formatCurrency(convertedPrice, selectedCurrency)} ={" "}
                  {formatCurrency(adultTotal, selectedCurrency)}
                </p>
                {guests.children > 0 && (
                  <p>
                    Children: {guests.children} ×{" "}
                    {formatCurrency(convertedPrice * 0.5, selectedCurrency)} ={" "}
                    {formatCurrency(childTotal, selectedCurrency)}
                  </p>
                )}

                {guests.infants > 0 && (
                  <p>
                    Infants: {guests.infants} × $0.00 ={" "}
                    {formatCurrency(infantTotal, selectedCurrency)}
                  </p>
                )}
                {featured && (
                  <p className="cart-product__discount">
                    Featured Discount: -10%
                  </p>
                )}
                <p className="cart-product__subtotal">
                  <strong>
                    Subtotal: {formatCurrency(totalTourPrice, selectedCurrency)}
                  </strong>
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="cart__fees">
        <h4>Additional fees</h4>
        <span>{formatCurrency(0.0, selectedCurrency)}</span>
      </div>
      <div className="cart__total">
        <h4>Total</h4>
        <p>
          {" "}
          <strong>{formatCurrency(totalPrice, selectedCurrency)}</strong>
        </p>
      </div>
    </div>
  );
};

export default BookingSummary;
