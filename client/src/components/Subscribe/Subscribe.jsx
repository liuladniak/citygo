import { useState } from "react";
import Button from "../Button/Button";
import "./Subscribe.scss";
import sendIcon from "../../assets/icons/send.svg";

const Subscribe = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [isValid, setIsValid] = useState(true);

  const handleSubmit = () => {
    // e.preventDefault();
    if (email.trim() === "") {
      setMessage("Email address cannot be empty.");
      setIsValid(false);
    } else if (!validateEmail(email)) {
      setMessage("Please enter a valid email address.");
      setIsValid(false);
    } else {
      setMessage("We've sent a verification link to your email address.");
      setIsValid(true);
      setEmail("");
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <section className="subscribe">
      <h2 className="subscribe-heading">Subscribe to our newsletter</h2>

      <form action={handleSubmit} className="subscribe-form">
        <input
          name="email"
          className="subscribe-input"
          placeholder="Enter your email..."
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setMessage("");
            setIsValid(true);
          }}
        />
        <Button
          type="submit"
          className="btn btn--subscribe"
          iconUrl={sendIcon}
          text="Subscribe"
          textClassName="btn__text--subscribe"
          iconClassName="btn__icon--subscribe"
        />
      </form>
      {message && (
        <p
          className={`message ${isValid ? "success-message" : "error-message"}`}
        >
          {message}
        </p>
      )}
    </section>
  );
};

export default Subscribe;
