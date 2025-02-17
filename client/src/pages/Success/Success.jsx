import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearCart } from "../../features/cart/cartSlice";
import { useNavigate } from "react-router-dom";

const Success = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(clearCart());
    setTimeout(() => navigate("/"), 3000);
  }, [dispatch, navigate]);

  return <h2>Payment Successful! Redirecting...</h2>;
};

export default Success;
