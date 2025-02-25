import { Link } from "react-router-dom";
const Confirmation = () => (
  <div className="confirmation">
    <h1>🎉 Payment Successful!</h1>
    <p>Your booking has been confirmed.</p>
    <Link to="/my-bookings">View My Bookings</Link>
  </div>
);
export default Confirmation;
