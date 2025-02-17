import "./HelpContact.scss";
import Map from "../../components/Map/Map";
import Accordion from "../../components/Accordion/Accordion";
import Button from "../../components/Button/Button";
import Icon from "../../components/UI/Icon";
import {
  iconCall,
  iconLocation,
  iconMail,
  iconPhone,
  iconSchedule,
} from "../../components/UI/iconsPaths";
import IconInstagram from "../../components/UI/IconInstagram";
import IconTikTok from "../../components/UI/IconTikTok";
import IconYoutube from "../../components/UI/IconYouTube";
import contactImg from "../../assets/images/office.jpg";
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
  return (
    <div className="contact">
      <div className="contact-banner">
        <h1 className="contact-heading">Get in Touch with CityGo</h1>
      </div>

      <div className="contact-main">
        <div className="contact-main__col contact-main__content">
          <p>
            We’d love to hear from you! Whether you have a question, need
            assistance with your booking, or just want to say hello, our team is
            here to help. Reach out to us through any of the contact details
            below, and we’ll get back to you as soon as possible.
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
          <div>
            {" "}
            <h3 className="contact-main__title">Follow Us On Social Media</h3>
            <div className="contact-main__el contact-main__el--socials">
              <div className="contact__social">
                <IconInstagram />
                <span className="contact-main__desc">Instagram</span>
              </div>
              <div className="contact__social">
                <IconTikTok />
                <span className="contact-main__desc">TikTok</span>
              </div>
              <div className="contact__social">
                <IconYoutube />
                <span className="contact-main__desc">YouTube</span>
              </div>
            </div>
          </div>
        </div>
        <div className="contact-main__col contact-main__map">
          <Map
            latitude={41.025658}
            longitude={28.974155}
            popupText="Our Office Location"
            category="Office"
          />
        </div>
      </div>
      <h2 className="form-heading">Contact form</h2>
      <div className="form-section">
        <form className="contact-form">
          <h2>Any Questions? </h2>
          <div className="contact-form__name">
            <div className="contact-form__el">
              <label className="contact-form__label">First Name</label>
              <input className="contact-form__input" placeholder="First Name" />
            </div>
            <div className="contact-form__el">
              <label className="contact-form__label">Last Name</label>
              <input className="contact-form__input" placeholder="Last Name" />
            </div>
          </div>
          <div className="contact-form__el">
            <label className="contact-form__label">Your Email</label>
            <input className="contact-form__input" placeholder="Your Email" />
          </div>
          <div className="contact-form__el">
            <label className="contact-form__label">Phone Number</label>
            <input className="contact-form__input" placeholder="Phone Number" />
          </div>
          <div className="contact-form__el">
            <label className="contact-form__label">Message</label>
            <textarea
              className="contact-form__input"
              placeholder="Message"
            ></textarea>
          </div>
          <Button>Send a Message</Button>
          <div>We've sent a confirmation message to your email address</div>
        </form>
        <div className="contact-img">
          <img src={contactImg} alt="" />
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
