import Button from "../../components/Button/Button";
import "./CheckoutPreview.scss";

const CheckoutPreview = () => {
  return (
    <div>
      <h1>Review your booking</h1>
      <div>
        <h3>Your tour</h3>
        <Button>Checkout</Button>
      </div>
    </div>
  );
};

export default CheckoutPreview;
