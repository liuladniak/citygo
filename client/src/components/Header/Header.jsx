import { Link } from "react-router-dom";
import { useContext, useEffect } from "react";
import "./Header.scss";
import Button from "../Button/Button";
import userAvatar from "../../assets/images/user-avatar.jpg";
import HamburgerIcon from "../../assets/icons/burger-menu-svgrepo-com.svg";
import logoutIcon from "../../assets/icons/logout.svg";
import useComponentVisible from "../../hooks/useComponentVisible";
import AuthContext from "../../contexts/AuthContext";
import arrowDown from "../../assets/icons/arrow-down.svg";
import logo from "../../assets/images/logo.png";
import logoIcon from "../../assets/images/logo-icon.png";

function Header() {
  const { auth, setAuth } = useContext(AuthContext);
  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false);

  const toggleDropdown = () => {
    setIsComponentVisible(!isComponentVisible);
  };

  const closeDropdown = () => {
    setIsComponentVisible(false);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setAuth({ isLoggedIn: false });
    closeDropdown();
  };

  const checkToken = () => {
    const token = sessionStorage.getItem("token");
    const tokenExpiration = sessionStorage.getItem("tokenExpiration");

    if (!token || new Date().getTime() > tokenExpiration) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("tokenExpiration");
      setAuth({ isLoggedIn: false });
    } else {
      setAuth({ isLoggedIn: true });
    }
  };

  useEffect(() => {
    checkToken();
    const interval = setInterval(checkToken, 1000);

    return () => clearInterval(interval);
  }, [setAuth]);

  return (
    <header className="header">
      <Link to="/" className="logo-link">
        <div className="logo">
          <img src={logoIcon} alt="logo icon" className="logo-icon" />
          <img src={logo} alt="logo" className="logo-img" />
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
            <Link className="nav__item-link nav__item-link-curr" to="/">
              <span>USD</span>
              <img src={arrowDown} alt="icon arrow down" />
            </Link>
          </li>
          {auth.isLoggedIn ? (
            <li className="nav__list-item manage-bookings">
              <div ref={ref} className="dropdown-wrapper">
                <Button
                  onClick={toggleDropdown}
                  className="btn nav__item-link btn--manage-bookings"
                >
                  <div className="nav-hamburger">
                    <img src={HamburgerIcon} alt="Hamburger Icon" />
                  </div>

                  <div className="user-avatar">
                    <img src={userAvatar} alt="user avatar" />
                    <div className="user-notification">1</div>
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
                    <li className="dropdown-item bookings-notification-wrp">
                      <Link to="/bookings" onClick={closeDropdown}>
                        Manage Bookings
                      </Link>
                      <div className="bookings-notification"></div>
                    </li>
                    <li className="dropdown-item">
                      <Link to="/my-profile" onClick={closeDropdown}>
                        My profile
                      </Link>
                    </li>
                    <li className="dropdown-item">
                      <Button
                        className="btn btn--logout"
                        onClick={logout}
                        iconUrl={logoutIcon}
                        iconClassName="btn--logout-icon"
                      >
                        Logout
                      </Button>
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
