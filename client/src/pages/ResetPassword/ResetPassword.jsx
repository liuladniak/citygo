import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../../components/Login/Login.scss";

const API_URL = import.meta.env.VITE_API_URL;

const getPasswordStrength = (password) => {
  if (!password) return null;
  if (password.length < 8)
    return { level: "weak", label: "Too short", width: "25%" };
  let score = 0;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { level: "weak", label: "Weak", width: "33%" };
  if (score <= 3) return { level: "fair", label: "Fair", width: "66%" };
  return { level: "strong", label: "Strong", width: "100%" };
};

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <main className="login-page">
        <div className="login-card">
          <h1 className="login-card__title">Invalid link</h1>
          <p className="login-card__subtitle">
            This reset link is invalid or has expired.
          </p>
          <Link
            to="/login"
            className="login-btn login-btn--primary"
            style={{ textDecoration: "none", textAlign: "center" }}
          >
            Back to sign in
          </Link>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { token, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Something went wrong. Please request a new reset link."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <main className="login-page">
        <div className="login-card">
          <div className="login-card__success">
            <p style={{ fontSize: "3.2rem" }}>✓</p>
            <h1 className="login-card__title">Password updated</h1>
            <p className="login-card__subtitle">
              Your password has been changed successfully. Redirecting you to
              sign in...
            </p>
            <Link to="/login" className="login-card__link">
              Sign in now
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const strength = getPasswordStrength(password);

  return (
    <main className="login-page">
      <div className="login-card">
        <h1 className="login-card__title">Choose a new password</h1>
        <p className="login-card__subtitle">
          Make it strong — you won't have to do this again for a while.
        </p>

        <form className="login-card__form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="password">New password</label>
            <div className="password-input-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="At least 8 characters"
                required
                className="login-input"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Hide" : "Show"}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {password && strength && (
              <div className="password-strength">
                <div className="password-strength__bar">
                  <div
                    className={`password-strength__fill password-strength__fill--${strength.level}`}
                    style={{ width: strength.width }}
                  />
                </div>
                <span
                  className={`password-strength__label password-strength__label--${strength.level}`}
                >
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div className="login-field">
            <label htmlFor="confirm">Confirm password</label>
            <div className="password-input-wrap">
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••"
                required
                className={`login-input ${
                  confirm && confirm !== password ? "login-input--error" : ""
                } ${
                  confirm && confirm === password ? "login-input--success" : ""
                }`}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm((p) => !p)}
                aria-label={showConfirm ? "Hide" : "Show"}
              >
                {showConfirm ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {confirm && confirm !== password && (
              <p className="login-field__hint login-field__hint--error">
                Passwords don't match
              </p>
            )}
            {confirm && confirm === password && (
              <p className="login-field__hint login-field__hint--success">
                Passwords match ✓
              </p>
            )}
          </div>

          {error && <p className="login-card__error">{error}</p>}

          <button
            type="submit"
            className="login-btn login-btn--primary"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default ResetPassword;
