import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { supabase } from "../../lib/supabaseClient";
import { fetchUserProfile } from "../../features/auth/authSlice";

function AuthCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleCallback = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        navigate("/login?error=google_failed");
        return;
      }

      await dispatch(fetchUserProfile());
      navigate("/tours");
    };

    handleCallback();
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
