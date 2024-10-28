import { Link } from "react-router-dom";
import "./Footer.scss";
import instaIcon from "../../assets/icons/instagram.svg";
import fbIcon from "../../assets/icons/facebook.svg";
import ytIcon from "../../assets/icons/youtube.svg";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-col">
        <Link className="footer-logo-link">CityGo</Link>
        <h4 className="footer-col-title">Contact us</h4>
        <Link className="footer-col-link" to="/">
          Address: Keas 69 Str. 15234, Chalandri Istanbul, Türkiye
        </Link>
      </div>
      <div className="footer-col">
        <h4 className="footer-col-title">For partners</h4>
        <div className="footer-col-content">
          <Link className="footer-col-link" to="/">
            About us
          </Link>
          <Link className="footer-col-link" to="/">
            Careers
          </Link>
          <Link className="footer-col-link" to="/">
            Media
          </Link>
          <Link className="footer-col-link" to="/">
            Corporate
          </Link>
          <Link className="footer-col-link" to="/">
            Partnerships
          </Link>
        </div>
      </div>
      <div className="footer-col">
        <h4 className="footer-col-title">Travel to Istanbul</h4>
        <div className="footer-col-content">
          <Link className="footer-col-link" to="/">
            All tours
          </Link>
          <Link className="footer-col-link" to="/">
            Culinary tours
          </Link>
          <Link className="footer-col-link" to="/">
            Experiences
          </Link>
          <Link className="footer-col-link" to="/">
            Transfers
          </Link>
          <Link className="footer-col-link" to="/">
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
              <img src={instaIcon} alt="instagram icon" />
            </Link>
            <Link
              className="footer-col-link footer-col-link--social"
              rel="noopener noreferrer"
              to="https://www.facebook.com/"
            >
              <img src={fbIcon} alt="facebook icon" />
            </Link>
            <Link
              className="footer-col-link footer-col-link--social"
              rel="noopener noreferrer"
              to="https://www.youtube.com/"
            >
              <img src={ytIcon} alt="youtube icon" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
