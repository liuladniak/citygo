import { useLocation, useNavigate } from "react-router-dom";

const useAuth = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthenticated = () => {
    return !!sessionStorage.getItem("token");
  };

  const checkAuth = () => {
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: location } });
    }
  };

  return { isAuthenticated, checkAuth };
};

export default useAuth;
