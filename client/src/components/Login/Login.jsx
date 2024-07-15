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

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/auth/login", {
        email: event.target.email.value,
        password: event.target.password.value,
      });

      const token = response.data.token;
      const expiresIn = response.data.expiresIn;
      const expirationTime = new Date().getTime() + expiresIn * 1000;

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("tokenExpiration", expirationTime);

      setAuth({ isLoggedIn: true });

      navigate("/bookings");
    } catch (error) {
      setError(error.response.data);
    }
  };

  return (
    <main className="login-page">
      <form className="login" onSubmit={handleSubmit}>
        <h1 className="login__title">Log in</h1>

        <Input type="text" name="email" label="Email" />
        <Input type="password" name="password" label="Password" />

        <Button className="btn btn--login">Log in</Button>

        {error && <div className="login__message">{error}</div>}
      </form>

      <p className="signup-cta">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </main>
  );
}

export default Login;
