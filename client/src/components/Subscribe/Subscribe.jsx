import { useState } from "react";
import Button from "../Button/Button";
import "./Subscribe.scss";
import sendIcon from "../../assets/icons/send.svg";

const Subscribe = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage({ text: "Please enter your email address.", type: "error" });
    } else if (!validateEmail(email)) {
      setMessage({
        text: "That doesn't look like a valid email address.",
        type: "error",
      });
    } else {
      setMessage({
        text: "✓ You're in! Check your inbox for a confirmation.",
        type: "success",
      });
      setEmail("");
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <section className="subscribe">
      <h2 className="subscribe-heading">Subscribe to our newsletter</h2>

      <form onSubmit={handleSubmit} className="subscribe-form">
        <input
          name="email"
          type="email"
          className="subscribe-input"
          placeholder="Your email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setMessage({ text: "", type: "" });
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

      <p
        className={`subscribe-message subscribe-message--${message.type || "hidden"}`}
      >
        {message.text || "\u00A0"}{" "}
      </p>
    </section>
  );
};
export default Subscribe;
