import { Link } from "react-router-dom";
import "./Header.scss";
import Button from "../Button/Button";
import userAvatar from "../../assets/images/user-avatar.jpg";
import HamburgerIcon from "../../assets/icons/burger-menu-svgrepo-com.svg";
import { useAuth } from "../../contexts/AuthContext";
import useComponentVisible from "../../hooks/useComponentVisible";

function Header() {
  const { user, isLoading, logout } = useAuth();
  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false);

  const toggleDropdown = () => {
    setIsComponentVisible(!isComponentVisible);
  };

  const closeDropdown = () => {
    setIsComponentVisible(false);
  };
  if (isLoading) {
    return null;
  }

  return (
    <header className="header">
      <Link to="/" className="logo-link">
        <div className="logo">
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
          {user ? (
            <li className="nav__list-item manage-bookings">
              <div ref={ref} className="dropdown-wrapper">
                <Button
                  onClick={toggleDropdown}
                  className="nav__item-link btn--manage-bookings"
                >
                  <div className="nav-hamburger">
                    <img src={HamburgerIcon} alt="Hamburger Icon" />
                  </div>

                  <div className="user-avatar">
                    <img src={userAvatar} alt="user avatar" />
                    <div className="user-notification">2</div>
                  </div>
                </Button>

                {isComponentVisible && (
                  <ul
                    className={`dropdown-menu ${
                      isComponentVisible
                        ? "dropdown--visible"
                        : "dropdown--hidden"
                    }`}
                  >
                    <li className="dropdown-item">
                      <Link to="/bookings" onClick={closeDropdown}>
                        Manage Bookings
                      </Link>
                    </li>
                    <li className="dropdown-item">
                      <button
                        onClick={() => {
                          logout();
                          closeDropdown();
                        }}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </li>
          ) : (
            <li className="nav__list-item">
              <Link className="nav__item-link" to="/login">
                Log in /
              </Link>
              <Link className="nav__item-link" to="/signup">
                Register
              </Link>
            </li>
          )}
        </ul>
        <ul className="nav__list">
          <li className="nav__item">
            <Link className="nav__item-link" to="/tours">
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
              Tour types
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
