import "./Login.scss";
import Input from "../../components/Input/Input";
import axios from "axios";
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import Button from "../Button/Button";

function Login() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);
  const API_URL = import.meta.env.VITE_API_KEY;

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: event.target.email.value,
        password: event.target.password.value,
      });

      const token = response.data.token;
      const expiresIn = response.data.expiresIn;
      const expirationTime = new Date().getTime() + expiresIn * 1000;

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("tokenExpiration", expirationTime);

      setAuth({ isLoggedIn: true });

      navigate("/tours");
    } catch (error) {
      setError(error.response.data);
    }
  };

  return (
    <main className="login-page">
      <form className="login" onSubmit={handleSubmit}>
        <h1 className="login__title">Log in</h1>

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

        <Button className="btn btn--login" text="Log in" />

        {error && <div className="login__message">{error}</div>}
      </form>

      <p className="signup-cta">
        Don't have an account?{" "}
        <Link className="signup-link" to="/signup">
          Sign up
        </Link>
      </p>
    </main>
  );
}

export default Login;
