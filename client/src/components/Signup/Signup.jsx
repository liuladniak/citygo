import "../Login/Login.scss";
import "./Signup.scss";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { supabase } from "../../lib/supabaseClient";
import { fetchUserProfile } from "../../features/auth/authSlice";

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

function Signup() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLoginLink, setShowLoginLink] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setShowLoginLink(false);

    if (form.password !== form.confirm_password) {
      setError("Passwords don't match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: {
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim(),
          },
        },
      });

      if (signupError) {
        if (signupError.message?.includes("already registered")) {
          setError("An account with this email already exists.");
          setShowLoginLink(true);
        } else {
          setError(
            signupError.message || "Registration failed. Please try again."
          );
        }
        return;
      }

      if (data.session) {
        await dispatch(fetchUserProfile());
        navigate("/tours");
      } else {
        navigate("/login?message=check_email");
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) {
      setError("Google sign-up failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const eyeOff = (
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
  );
  const eyeOn = (
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
  );

  return (
    <main className="login-page">
      <div className="login-card">
        <h1 className="login-card__title">Create an account</h1>
        <p className="login-card__subtitle">
          Join CityGo to book and manage your tours
        </p>

        <button
          className="login-btn login-btn--google"
          onClick={handleGoogleSignup}
          disabled={googleLoading}
          type="button"
        >
          <svg
            className="login-btn__icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {googleLoading ? "Redirecting..." : "Continue with Google"}
        </button>

        <div className="login-divider">
          <span className="login-divider__line" />
          <span className="login-divider__text">or</span>
          <span className="login-divider__line" />
        </div>

        <form className="login-card__form" onSubmit={handleSubmit}>
          <div className="signup-name-row">
            <div className="login-field">
              <label htmlFor="first_name">First name</label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={form.first_name}
                onChange={handleChange}
                placeholder="John"
                required
                className="login-input"
                autoComplete="given-name"
              />
            </div>
            <div className="login-field">
              <label htmlFor="last_name">Last name</label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Smith"
                required
                className="login-input"
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
              className="login-input"
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                required
                minLength={8}
                className="login-input"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? eyeOff : eyeOn}
              </button>
            </div>
            {form.password &&
              (() => {
                const strength = getPasswordStrength(form.password);
                return (
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
                );
              })()}
            {form.password && (
              <ul className="password-reqs">
                <li
                  className={`password-reqs__item ${
                    form.password.length >= 8 ? "password-reqs__item--met" : ""
                  }`}
                >
                  <span className="password-reqs__icon">
                    {form.password.length >= 8 ? "✓" : "○"}
                  </span>
                  At least 8 characters
                </li>
                <li
                  className={`password-reqs__item ${
                    /[A-Z]/.test(form.password)
                      ? "password-reqs__item--met"
                      : ""
                  }`}
                >
                  <span className="password-reqs__icon">
                    {/[A-Z]/.test(form.password) ? "✓" : "○"}
                  </span>
                  One uppercase letter
                </li>
                <li
                  className={`password-reqs__item ${
                    /[0-9]/.test(form.password)
                      ? "password-reqs__item--met"
                      : ""
                  }`}
                >
                  <span className="password-reqs__icon">
                    {/[0-9]/.test(form.password) ? "✓" : "○"}
                  </span>
                  One number
                </li>
              </ul>
            )}
          </div>

          <div className="login-field">
            <label htmlFor="confirm_password">Confirm password</label>
            <div className="password-input-wrap">
              <input
                id="confirm_password"
                name="confirm_password"
                type={showConfirm ? "text" : "password"}
                value={form.confirm_password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className={`login-input ${
                  form.confirm_password &&
                  form.confirm_password !== form.password
                    ? "login-input--error"
                    : ""
                } ${
                  form.confirm_password &&
                  form.confirm_password === form.password
                    ? "login-input--success"
                    : ""
                }`}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm((p) => !p)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? eyeOff : eyeOn}
              </button>
            </div>
            {form.confirm_password &&
              form.confirm_password !== form.password && (
                <p className="login-field__hint login-field__hint--error">
                  Passwords don't match
                </p>
              )}
            {form.confirm_password &&
              form.confirm_password === form.password && (
                <p className="login-field__hint login-field__hint--success">
                  Passwords match ✓
                </p>
              )}
          </div>

          {error && (
            <div>
              <p className="login-card__error">{error}</p>
              {showLoginLink && (
                <p
                  className="login-card__footer"
                  style={{ marginTop: "0.8rem" }}
                >
                  <Link to="/login" className="login-card__link">
                    Sign in instead →
                  </Link>
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="login-btn login-btn--primary"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="login-card__footer">
          Already have an account?{" "}
          <Link to="/login" className="login-card__link">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Signup;
