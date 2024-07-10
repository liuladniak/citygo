import { useState } from "react";
import Button from "../Button/Button";
import "./Subscribe.scss";

const Subscribe = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateEmail(email)) {
      setMessage("Thank you for subscribing!");
      setEmail("");
    } else {
      setMessage("Please enter a valid email address.");
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <section className="subscribe">
      <h2 className="subscribe-heading">Subscribe to our newsletter</h2>
      <form onSubmit={handleSubmit} className="subscribe-form">
        <input
          className="subscribe-input"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" className="btn--subscribe">
          Subscribe
        </Button>
      </form>
      {message && (
        <p
          className={validateEmail(email) ? "success-message" : "error-message"}
        >
          {message}
        </p>
      )}
    </section>
  );
};

export default Subscribe;
