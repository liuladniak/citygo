import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../features/auth/authSlice";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get("token");
    const expires = searchParams.get("expires");
    const error = searchParams.get("error");

    if (error || !token) {
      navigate("/login?error=google_failed");
      return;
    }

    const finishLogin = async () => {
      try {
        const userResponse = await axios.get(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        dispatch(
          login({
            token,
            tokenExpiration: expires,
            user: userResponse.data,
          })
        );

        navigate("/tours");
      } catch {
        navigate("/login?error=google_failed");
      }
    };

    finishLogin();
  }, []);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.4rem",
        color: "#6b7280",
      }}
    >
      Signing you in...
    </div>
  );
}

export default AuthCallback;
