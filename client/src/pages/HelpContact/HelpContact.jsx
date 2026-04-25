import "./HelpContact.scss";
import Map from "../../components/Map/Map";
import Accordion from "../../components/Accordion/Accordion";
import Icon from "../../components/UI/Icon";
import {
  iconCall,
  iconCheck,
  iconLocation,
  iconMail,
  iconPhone,
  iconSchedule,
} from "../../components/UI/iconsPaths";
import contactImg from "../../assets/images/office.jpg";
import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const faqs = [
  {
    id: 1,
    question: "What is your refund policy?",
    answer: "Our refund policy allows returns within 30 days of purchase.",
  },
  {
    id: 2,
    question: "How do I change my booking date?",
    answer: "You can change your booking date by contacting our support team.",
  },
  {
    id: 3,
    question: "Do you offer group discounts?",
    answer: "Yes, we offer discounts for groups of 10 or more.",
  },
];

const HelpContact = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState(null);

  const validate = (data) => {
    const errs = {};
    if (!data.first_name.trim()) errs.first_name = "First name is required.";
    if (!data.last_name.trim()) errs.last_name = "Last name is required.";
    if (!data.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(data.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!data.message.trim()) {
      errs.message = "Message is required.";
    } else if (data.message.trim().length < 10) {
      errs.message = "Message is too short.";
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/contact`, formData);
      setSuccess(true);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (err) {
      setServerError(
        err.response?.data?.error ||
          "Something went wrong. Please try again or email us directly."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="contact">
      <div className="contact-banner">
        <h1 className="contact-heading--main">Get in Touch with CityGo</h1>
      </div>

      <h2 className="contact__heading">We'd love to hear from you!</h2>

      <div className="contact-main">
        <div className="contact-main__col contact-main__content">
          <p>
            Whether you have a question, need assistance with your booking, or
            just want to say hello, our team is here to help. Reach out to us
            through any of the contact details below, and we'll get back to you
            as soon as possible.
          </p>
          <div className="contact-main__el">
            <Icon iconPath={iconMail} />
            <span className="contact-main__title">Email:</span>
            <span className="contact-main__desc">
              support@citygoistanbul.com
            </span>
          </div>
          <div className="contact-main__el">
            <Icon iconPath={iconCall} />
            <span className="contact-main__title">Phone:</span>
            <span className="contact-main__desc">+90 212 555 1234</span>
          </div>
          <div className="contact-main__el">
            <Icon iconPath={iconPhone} />
            <span className="contact-main__title">WhatsApp:</span>
            <span className="contact-main__desc">+90 555 678 9101</span>
          </div>
          <div className="contact-main__el">
            <Icon iconPath={iconLocation} />
            <span className="contact-main__title">Address:</span>
            <span className="contact-main__desc">
              CityGo Istanbul, Bereketzade Mahallesi, Galata Kulesi Sokak No:10,
              Beyoğlu, İstanbul, Turkey
            </span>
          </div>
          <div className="contact-main__el">
            <Icon iconPath={iconSchedule} />
            <span className="contact-main__title">Office Hours:</span>
            <span className="contact-main__desc">
              Monday–Sunday: 9:00 AM – 6:00 PM (GMT+3)
            </span>
          </div>
        </div>
        <div className="contact-main__col contact-main__map">
          <Map
            latitude={41.025658}
            longitude={28.974155}
            popupText="Our Office Location"
            category="Office"
            className="map-office"
          />
        </div>
      </div>

      <div className="form-section">
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="contact-form__header">
            <h2 className="contact-form__title">Send us a message</h2>
            <p className="contact-form__subtitle">
              We'll get back to you within 24 hours.
            </p>
          </div>

          {success ? (
            <div className="contact-success">
              <Icon iconPath={iconCheck} />
              <div>
                <p className="contact-success__title">Message sent!</p>
                <p className="contact-success__text">
                  Thanks for reaching out. We'll get back to you soon.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="contact-form__name">
                <div className="contact-form__el">
                  <label className="contact-form__label" htmlFor="first_name">
                    First name <span className="contact-form__required">*</span>
                  </label>
                  <input
                    id="first_name"
                    className={`contact-form__input ${
                      errors.first_name ? "contact-form__input--error" : ""
                    }`}
                    placeholder="John"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    autoComplete="given-name"
                  />
                  {errors.first_name && (
                    <span className="contact-form__error">
                      {errors.first_name}
                    </span>
                  )}
                </div>
                <div className="contact-form__el">
                  <label className="contact-form__label" htmlFor="last_name">
                    Last name <span className="contact-form__required">*</span>
                  </label>
                  <input
                    id="last_name"
                    className={`contact-form__input ${
                      errors.last_name ? "contact-form__input--error" : ""
                    }`}
                    placeholder="Smith"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    autoComplete="family-name"
                  />
                  {errors.last_name && (
                    <span className="contact-form__error">
                      {errors.last_name}
                    </span>
                  )}
                </div>
              </div>

              <div className="contact-form__row">
                <div className="contact-form__el">
                  <label className="contact-form__label" htmlFor="email">
                    Your email address
                    <span className="contact-form__required">*</span>
                  </label>
                  <input
                    id="email"
                    className={`contact-form__input ${
                      errors.email ? "contact-form__input--error" : ""
                    }`}
                    placeholder="john@example.com"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <span className="contact-form__error">{errors.email}</span>
                  )}
                </div>
                <div className="contact-form__el">
                  <label className="contact-form__label" htmlFor="phone">
                    Phone{" "}
                    <span className="contact-form__optional">(optional)</span>
                  </label>
                  <input
                    id="phone"
                    className="contact-form__input"
                    placeholder="+1 234 567 890"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="contact-form__el">
                <label className="contact-form__label" htmlFor="message">
                  Message <span className="contact-form__required">*</span>
                </label>
                <textarea
                  id="message"
                  className={`contact-form__input contact-form__textarea ${
                    errors.message ? "contact-form__input--error" : ""
                  }`}
                  placeholder="How can we help you?"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                />
                <div className="contact-form__meta">
                  {errors.message && (
                    <span className="contact-form__error">
                      {errors.message}
                    </span>
                  )}
                  <span className="contact-form__count">
                    {formData.message.length}/2000
                  </span>
                </div>
              </div>

              {serverError && (
                <div className="contact-form__server-error">{serverError}</div>
              )}

              <button
                type="submit"
                className="contact-form__submit"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Message"}
              </button>
            </>
          )}
        </form>

        <div className="contact-img">
          <img src={contactImg} alt="CityGo office" loading="lazy" />
        </div>
      </div>

      <div className="container-centered contact-faq">
        <h2 className="contact-faq__heading">Frequently Asked Questions</h2>
        <Accordion items={faqs} />
      </div>
    </div>
  );
};

export default HelpContact;
