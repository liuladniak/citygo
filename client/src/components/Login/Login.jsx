import "./Login.scss";
import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { supabase } from "../../lib/supabaseClient";
import { fetchUserProfile } from "../../features/auth/authSlice";

const TEST_EMAIL = import.meta.env.VITE_TEST_EMAIL;
const TEST_PASSWORD = import.meta.env.VITE_TEST_PASSWORD;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const googleError = searchParams.get("error");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (authError) throw authError;
      await dispatch(fetchUserProfile());
      navigate("/tours");
    } catch (err) {
      if (err.message?.includes("Invalid login credentials")) {
        setError("Incorrect email or password.");
      } else {
        setError(err.message || "Sign in failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrefillTest = () => {
    setEmail(TEST_EMAIL);
    setPassword(TEST_PASSWORD);
    setError(null);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (authError) {
      setError("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError(null);

    if (resetEmail.trim().toLowerCase() === TEST_EMAIL?.toLowerCase()) {
      setResetError(
        "This is a demo account — password reset is not available."
      );
      return;
    }

    setResetLoading(true);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(
        resetEmail.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      if (resetErr) throw resetErr;
      setResetSent(true);
    } catch {
      setResetSent(true);
    } finally {
      setResetLoading(false);
    }
  };

  if (showReset) {
    return (
      <main className="login-page">
        <div className="login-card">
          <h1 className="login-card__title">Reset your password</h1>
          <p className="login-card__subtitle">
            Enter your email and we'll send you a reset link.
          </p>
          {resetSent ? (
            <div className="login-card__success">
              <p>Check your inbox — a reset link is on its way.</p>
              <button
                className="login-card__link"
                onClick={() => {
                  setShowReset(false);
                  setResetSent(false);
                  setResetEmail("");
                }}
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <form className="login-card__form" onSubmit={handleResetSubmit}>
              <div className="login-field">
                <label htmlFor="reset-email">Email</label>
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="login-input"
                />
              </div>
              {resetError && <p className="login-card__error">{resetError}</p>}
              <button
                type="submit"
                className="login-btn login-btn--primary"
                disabled={resetLoading}
              >
                {resetLoading ? "Sending..." : "Send reset link"}
              </button>
              <button
                type="button"
                className="login-card__link"
                onClick={() => setShowReset(false)}
              >
                Back to sign in
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <h1 className="login-card__title">Welcome back</h1>
        <p className="login-card__subtitle">Sign in to your CityGo account</p>

        {googleError === "try_again" && (
          <p className="login-card__error">
            Something interrupted the sign-in. Please try again.
          </p>
        )}
        {googleError === "google_failed" && (
          <p className="login-card__error">
            Google sign-in failed. Please try again or use email.
          </p>
        )}

        <button
          className="login-btn login-btn--google"
          onClick={handleGoogleLogin}
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
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="john@example.com"
              required
              className="login-input"
              autoComplete="email"
            />
          </div>
          <div className="login-field">
            <div className="login-field__header">
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="login-card__link"
                onClick={() => setShowReset(true)}
              >
                Forgot password?
              </button>
            </div>
            <div className="password-input-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••"
                required
                className="login-input"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Hide password" : "Show password"}
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
          </div>
          {error && <p className="login-card__error">{error}</p>}
          <button
            type="submit"
            className="login-btn login-btn--primary"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="login-demo">
          <span className="login-demo__label">Exploring the app?</span>
          <button
            type="button"
            className="login-demo__btn"
            onClick={() => {
              console.log("creds:", TEST_EMAIL, TEST_PASSWORD);
              handlePrefillTest();
            }}
          >
            Fill test credentials
          </button>
        </div>

        <p className="login-card__footer">
          Don't have an account?{" "}
          <Link to="/signup" className="login-card__link">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
