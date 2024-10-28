import { useState } from "react";
import Button from "../Button/Button";
import "./Subscribe.scss";
import sendIcon from "../../assets/icons/send.svg";

const Subscribe = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isValid, setIsValid] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim() === "") {
      setMessage("Email address cannot be empty.");
      setIsValid(false);
    } else if (!validateEmail(email)) {
      setMessage("Please enter a valid email address.");
      setIsValid(false);
    } else {
      setMessage("Thank you for subscribing!");
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
      <form onSubmit={handleSubmit} className="subscribe-form">
        <input
          className="subscribe-input"
          placeholder="Enter your email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        <p className={isValid ? "success-message" : "error-message"}>
          {message}
        </p>
      )}
    </section>
  );
};

export default Subscribe;
