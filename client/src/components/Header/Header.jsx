import { Link } from "react-router-dom";
import { useEffect } from "react";
import "./Header.scss";
import Button from "../Button/Button";
import userAvatar from "../../assets/images/user-avatar.jpg";
import HamburgerIcon from "../../assets/icons/burger-menu-svgrepo-com.svg";
import logoutIcon from "../../assets/icons/logout.svg";
import useComponentVisible from "../../hooks/useComponentVisible";
import arrowDown from "../../assets/icons/arrow-down.svg";
import cartIcon from "../../assets/icons/cart.svg";
import logo from "../../assets/images/logo.png";
import logoIcon from "../../assets/images/logo-icon.png";
import { useDispatch, useSelector } from "react-redux";
import { logout, checkToken } from "../../features/auth/authSlice";

function Header() {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);

  const totalBookings = useSelector((state) => state.cart.totalBookings);

  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false);

  const toggleDropdown = () => {
    setIsComponentVisible(!isComponentVisible);
  };

  const closeDropdown = () => {
    setIsComponentVisible(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    dispatch(logout());
    closeDropdown();
  };

  useEffect(() => {
    dispatch(checkToken());
    const interval = setInterval(() => dispatch(checkToken()), 1000);

    return () => clearInterval(interval);
  }, [checkToken]);

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
          <li className="nav__list-item">
            <Link className="nav__item-link nav__item-link--cart" to="/cart">
              <img src={cartIcon} alt="icon shopping cart" />
              {totalBookings > 0 && (
                <div className="cart-notification">{totalBookings}</div>
              )}
            </Link>
          </li>
          {isLoggedIn ? (
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
                    <li className="dropdown-item bookings-cart-wrp">
                      <Link to="/cart" onClick={closeDropdown}>
                        Cart
                      </Link>
                      <div className="bookings-cart"></div>
                    </li>
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
                        onClick={handleLogout}
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
