import { Link } from "react-router-dom";
import "./Footer.scss";
import istLogo from "../../assets/logos/stickers-istanbul-tulip-logo-removebg-preview.png";
import Certification from "../Certification/Certification";
import IconInstagram from "../UI/IconInstagram";
import IconTikTok from "../UI/IconTikTok";
import IconYoutube from "../UI/IconYouTube";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="wrp">
      <footer className="footer-wrp">
        <div className="footer">
          <div className="footer-col">
            <Link className="footer-logo-link">CityGo</Link>
            <h4 className="footer-col-title">Contact us</h4>
            <Link className="footer-col-link" to="/">
              Address: CityGo Istanbul, Bereketzade Mahallesi, Galata Kulesi
              Sokak No:10, Beyoğlu, İstanbul, Turkey
            </Link>
            <div className="footer-ist-logo">
              <img src={istLogo} alt="istanbul tulip logo" />
            </div>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">For partners</h4>
            <div className="footer-col-content">
              <Link className="footer-col-link" to="/about">
                About us
              </Link>
              <Link className="footer-col-link" to="/about">
                Careers
              </Link>
              <Link className="footer-col-link" to="/about">
                Media
              </Link>
              <Link className="footer-col-link" to="/contact">
                Corporate
              </Link>
              <Link className="footer-col-link" to="/contact">
                Partnerships
              </Link>
            </div>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">Travel to Istanbul</h4>
            <div className="footer-col-content">
              <Link className="footer-col-link" to="/tours">
                All tours
              </Link>
              <Link
                className="footer-col-link"
                to="/tours?category=Culinary%20tour"
              >
                Culinary tours
              </Link>
              <Link className="footer-col-link" to="/tours?category=Experience">
                Experiences
              </Link>
              <Link className="footer-col-link" to="/contact">
                Transfers
              </Link>
              <Link className="footer-col-link" to="/travel-guide">
                Private tours
              </Link>
            </div>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">Stay in touch</h4>
            <div className="footer-col-content">
              <Link className="footer-col-link" to="/">
                Subscribe to our Newsletter for the latest updates and special
                offers
              </Link>
              <Link className="footer-col-link" to="/">
                Follow us on Social Media
              </Link>
              <div className="footer-col-socials">
                <Link
                  className="footer-col-link footer-col-link--social"
                  rel="noopener noreferrer"
                  to="https://www.instagram.com/"
                >
                  <IconInstagram className="footer-socials" />
                </Link>
                <Link
                  className="footer-col-link footer-col-link--social"
                  rel="noopener noreferrer"
                  to="https://www.tiktok.com/"
                >
                  <IconTikTok className="footer-socials" />
                </Link>
                <Link
                  className="footer-col-link footer-col-link--social"
                  rel="noopener noreferrer"
                  to="https://www.youtube.com/"
                >
                  <IconYoutube className="footer-socials" />
                </Link>
              </div>
            </div>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">Licenses & Certificates</h4>
            <Certification />
          </div>
        </div>
      </footer>
      <p className="credit">Media from: GoTurkiye.com & @go_istanbul</p>
      <p className="disclaimer">
        Disclaimer: This app is not used for commercial purposes and does not
        offer any services or products. Used only for personal learning
        experience.
      </p>

      <p className="copy">
        &copy; LLAD Studios - All rights reserved - {currentYear}
      </p>
    </div>
  );
};

export default Footer;
