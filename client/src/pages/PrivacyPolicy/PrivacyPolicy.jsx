// Shares its layout and styles with the Cookie Policy page.
import "../CookiePolicy/CookiePolicy.scss";
import { Link } from "react-router-dom";

const SUPPORT_EMAIL = "support@citygoistanbul.com";

const PrivacyPolicy = () => {
  return (
    <div className="cookie-policy">
      <div className="cookie-policy__header">
        <h1 className="cookie-policy__title">Privacy Policy</h1>
        <p className="cookie-policy__updated">Last updated: November 2026</p>
      </div>

      <div className="cookie-policy__body">
        <section className="cookie-policy__section">
          <h2 className="cookie-policy__heading">Who we are</h2>
          <p>
            CityGo is a tour-booking website for Istanbul city tours, run by
            LLAD Studios. This page explains what personal information we
            collect, why, and what you can do about it.
          </p>
        </section>

        <section className="cookie-policy__section">
          <h2 className="cookie-policy__heading">What we collect</h2>
          <ul className="cookie-policy__list">
            <li>
              <strong>Account details:</strong> your name, email address and
              password (stored securely by our sign-in provider) when you create
              an account.
            </li>
            <li>
              <strong>Booking details:</strong> the tour, date, number of
              guests, and the contact name, email and phone number you give us
              so we can run your tour.
            </li>
            <li>
              <strong>Payments:</strong> card payments are handled by Stripe. We
              never see or store your full card number.
            </li>
            <li>
              <strong>Messages to us:</strong> what you write in the Milo chat
              or send through the contact page, and your name and email if you
              ask to talk to a person.
            </li>
            <li>
              <strong>Usage data:</strong> basic, anonymous statistics about how
              the site is used (pages visited, device type), collected with
              Google Analytics.
            </li>
          </ul>
        </section>

        <section className="cookie-policy__section">
          <h2 className="cookie-policy__heading">How we use it</h2>
          <p>
            We use your information to take and manage your booking, send you
            confirmations and reminders by email, answer your questions, keep
            the site secure, and improve the site. We do not sell your personal
            information.
          </p>
        </section>

        <section className="cookie-policy__section">
          <h2 className="cookie-policy__heading">Who we share it with</h2>
          <p>
            We only share what is needed, with the services that help us run
            CityGo:
          </p>
          <ul className="cookie-policy__list">
            <li>Supabase, for sign-in and our database.</li>
            <li>Stripe, to process payments.</li>
            <li>Brevo, to send booking emails.</li>
            <li>Google Analytics, for anonymous usage statistics.</li>
            <li>
              Google's AI service, only when Milo answers a typed question it
              could not match itself. Please do not include personal details in
              chat messages.
            </li>
          </ul>
          <p>
            Our tour guides see the details of the bookings assigned to them.
          </p>
        </section>

        <section className="cookie-policy__section">
          <h2 className="cookie-policy__heading">How long we keep it</h2>
          <p>
            Milo chat messages are kept for 90 days. Booking and account records
            are kept while your account is active and as long as we need them
            for our business and legal obligations, then deleted or anonymised.
          </p>
        </section>

        <section className="cookie-policy__section">
          <h2 className="cookie-policy__heading">Your choices</h2>
          <p>
            You can ask us to show you the information we hold about you,
            correct it, or delete it. Write to{" "}
            <a
              className="cookie-policy__link"
              href={`mailto:${SUPPORT_EMAIL}`}
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            and we will reply as soon as we can. You can also change your cookie
            choices at any time from the footer. See our{" "}
            <Link to="/cookie-policy" className="cookie-policy__link">
              Cookie Policy
            </Link>{" "}
            for details.
          </p>
        </section>

        <section className="cookie-policy__section">
          <h2 className="cookie-policy__heading">Changes to this policy</h2>
          <p>
            If we change how we handle personal information, we will update this
            page and the date at the top.
          </p>
        </section>

        <section className="cookie-policy__section">
          <h2 className="cookie-policy__heading">Contact</h2>
          <p>
            Questions about privacy?{" "}
            <Link to="/contact" className="cookie-policy__link">
              Get in touch
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
