import { Link } from "react-router-dom";
// import logoImg from "../../assets/logo/logo.png";
import "./Header.scss";

function Header() {
  return (
    <header className="header">
      <Link to="/" className="logo-link">
        <div className="logo">
          {/* <img src={logoImg} alt="logo-2" /> */}
          <h2>Logo</h2>
        </div>
      </Link>

      <nav className="nav">
        <ul className="nav__list">
          <li className="nav__item">
            <Link className="nav__item-link" to="/">
              +1 (234) 455 56-56
            </Link>
          </li>
          <li className="nav__list-item">
            <Link className="nav__item-link" to="/">
              Help & Contact
            </Link>
          </li>
          <li className="nav__list-item">
            <Link className="nav__item-link" to="/">
              About us
            </Link>
          </li>
          <li className="nav__list-item">
            <Link className="nav__item-link" to="/">
              USD
            </Link>
          </li>
          <li className="nav__list-item">
            <Link className="nav__item-link" to="/">
              Log in / Register
            </Link>
          </li>
          <li className="nav__list-item">
            <Link className="nav__item-link" to="/">
              Manage my bookings
            </Link>
          </li>
        </ul>
        <ul className="nav__list">
          <li className="nav__item">
            <Link className="nav__item-link" to="/">
              All tours
            </Link>
          </li>
          <li className="nav__list-item">
            <Link className="nav__item-link" to="/">
              Destinations
            </Link>
          </li>
          <li className="nav__list-item">
            <Link className="nav__item-link" to="/">
              Categories
            </Link>
          </li>
          <li className="nav__list-item">
            <Link className="nav__item-link" to="/">
              Transfers
            </Link>
          </li>
          <li className="nav__list-item">
            <Link className="nav__item-link" to="/">
              Travel Guide
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
