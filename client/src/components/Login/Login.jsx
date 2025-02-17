import "./Login.scss";
import Input from "../../components/Input/Input";
import axios from "axios";
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import Button from "../Button/Button";
import { useDispatch } from "react-redux";
import { login } from "../../features/auth/authSlice";

function Login() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setAuth } = useContext(AuthContext);
  const API_URL = import.meta.env.VITE_API_KEY;

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: event.target.email.value,
        password: event.target.password.value,
      });
      console.log("LOGIN RESPONSE:", response.data);
      const token = response.data.token;
      const expiresIn = response.data.expiresIn;
      const expirationTime = new Date().getTime() + expiresIn * 1000;

      const userResponse = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("LOGIN RESPONSE:", userResponse);
      dispatch(
        login({
          token,
          tokenExpiration: expirationTime,

          user: userResponse.data,
        })
      );

      localStorage.setItem("token", token);
      localStorage.setItem("tokenExpiration", expirationTime);

      setAuth({ isLoggedIn: true });

      navigate("/tours");
    } catch (error) {
      setError(error.response.data);
    }
  };

  const handleTestUserLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/test-login`);

      const token = response.data.token;
      const expiresIn = response.data.expiresIn;
      const expirationTime = new Date().getTime() + expiresIn * 1000;

      const testUserResponse = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("TEST LOGIN RESPONSE:", testUserResponse);
      dispatch(
        login({
          token,
          tokenExpiration: expirationTime,
          user: testUserResponse.data,
        })
      );

      localStorage.setItem("token", token);
      localStorage.setItem("tokenExpiration", expirationTime);

      setAuth({ isLoggedIn: true });

      navigate("/tours");
    } catch (error) {
      setError("Failed to sign in as Test User.");
    }
  };

  return (
    <main className="login-page">
      <div className="login-wrp">
        <form className="login" onSubmit={handleSubmit}>
          <h1 className="login__title">Sign in</h1>

          <Input
            type="text"
            name="email"
            label="Email"
            defaultValue="liu@liu.com"
          />

          <Input
            type="password"
            name="password"
            label="Password"
            defaultValue="1234"
          />

          <Button className="btn btn--login" text="Sign in" />

          {error && <div className="login__message">{error}</div>}
        </form>
        <p className="login-or">Or</p>
        <div>
          <Button
            onClick={handleTestUserLogin}
            className="btn btn--login"
            text="Sign in as Test User"
          />
        </div>

        <p className="signup-cta">
          Don't have an account?{" "}
          <Link className="signup-link" to="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
