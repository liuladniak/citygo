import Button from "../Button/Button";
import "./ProductSummary.scss";
import { formatCurrency } from "../../utils/formatCurrency";
import { API_URL } from "../../utils/api";

const ProductSummary = ({ mainImage, bookings, makePayment }) => {
  if (!bookings || bookings.length === 0) {
    return <p>Your cart is empty.</p>;
  }
  // console.log(`${API_URL}/${bookings[0].mainImage}`);
  console.log(bookings[0]);

  return (
    <div className="cart-product">
      <div className="cart-product__img">
        <img src={`${API_URL}/${mainImage}`} alt="kkj" />
      </div>
      <div className="cart-product__desc">{bookings[0].title}</div>
      <div className="cart-product__desc">
        {formatCurrency(bookings[0].price)}
      </div>
      <Button className="btn btn--book" onClick={makePayment}>
        Pay
      </Button>
    </div>
  );
};

export default ProductSummary;
