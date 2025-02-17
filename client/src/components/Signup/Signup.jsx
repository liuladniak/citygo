import "./Signup.scss";
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Input from "../../components/Input/Input";
import Button from "../Button/Button";

function Signup() {
  const API_URL = import.meta.env.VITE_API_KEY;

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await axios.post(`${API_URL}/auth/signup`, {
        first_name: event.target.first_name.value,
        last_name: event.target.last_name.value,
        phone_number: event.target.phone.value,
        email: event.target.email.value,
        password: event.target.password.value,
      });

      setSuccess(true);
      setError(null);
      event.target.reset();
    } catch (error) {
      setSuccess(false);
      setError(error.response.data);
    }
  };

  return (
    <main className="signup-page">
      <form className="signup" onSubmit={handleSubmit}>
        <h1 className="signup__title">Sign up</h1>

        <Input type="text" name="first_name" label="First name" />
        <Input type="text" name="last_name" label="Last name" />
        <Input type="text" name="phone" label="Phone" />
        <Input type="text" name="email" label="Email" />
        <Input type="password" name="password" label="Password" />

        <Button className="btn btn--signup" text="Sign up" />

        {success && <div className="signup__message">Signed up!</div>}
        {error && <div className="signup__message">{error}</div>}
      </form>
      <p className="login-cta">
        Have an account?{" "}
        <Link className="signup-link" to="/login">
          Log in
        </Link>
      </p>
    </main>
  );
}

export default Signup;
