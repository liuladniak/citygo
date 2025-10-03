import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Header.scss";
import Button from "../Button/Button";
import HamburgerIcon from "../../assets/icons/burger-menu-svgrepo-com.svg";
import logoutIcon from "../../assets/icons/logout.svg";
import useComponentVisible from "../../hooks/useComponentVisible";
import cartIcon from "../../assets/icons/cart.svg";
import phoneIcon from "../../assets/icons/phone.svg";
import saveIcon from "../../assets/icons/heart.svg";
import logo from "../../assets/logos/logo.png";

import logoIcon from "../../assets/images/logo-icon.png";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchExchangeRates,
  setCurrency,
} from "../../features/currency/currencySlice";
import { logout, checkToken } from "../../features/auth/authSlice";
import CustomSelect from "../CustomSelect/CustomSelect";
import Icon from "../UI/Icon";
import { iconArrowDown, iconArrowUp, iconSignout } from "../UI/iconsPaths";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.auth.user);
  const [isOpen, setIsOpen] = useState(false);
  const selectedCurrency = useSelector(
    (state) => state.currency.selectedCurrency
  );
  const currencyOptions = ["USD", "EUR", "TRY"];

  const totalBookings = useSelector((state) => state.cart.totalBookings);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false);

  const toggleDropdown = () => {
    setIsComponentVisible(!isComponentVisible);
  };

  const closeDropdown = () => {
    setIsComponentVisible(false);
    setIsOpen(false);
  };
  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    closeDropdown();
    navigate("/");
  };

  // useEffect(() => {
  //   dispatch(checkToken());
  //   const interval = setInterval(() => dispatch(checkToken()), 10000);

  //   return () => clearInterval(interval);
  // }, [checkToken]);

  useEffect(() => {
    dispatch(fetchExchangeRates());
  }, [dispatch]);

  const handleCurrencyChange = (currency) => {
    dispatch(setCurrency(currency));
  };
  const getInitials = (firstName, lastName) => {
    if (!firstName || !lastName) return "";
    return firstName[0].toUpperCase() + lastName[0].toUpperCase();
  };

  console.log("header user", user);

  return (
    <header className="header">
      <Link to="/" className="logo-link" onClick={closeMenu}>
        <div className="logo">
          <img src={logoIcon} alt="logo icon" className="logo-icon" />
          <img src={logo} alt="logo" className="logo-img" />
        </div>
      </Link>

      <div className="burger-wrp">
        <li className="nav__item--phone-mobile" onClick={closeMenu}>
          <a
            className="nav__item-link nav__item-link--phone"
            href="tel:+12344555656"
          >
            <span className="phone-text">+1 (234) 455 56-56</span>
            <img className="nav__icon" src={phoneIcon} alt="phone icon" />
          </a>
        </li>

        <div className="burger-wrp" onClick={toggleMenu}>
          <span className="burger-title">{isOpen ? "Close" : "Menu"}</span>

          <button className={`burger-menu ${isOpen ? "open" : ""}`}>
            <span className="burger-bar"></span>
            <span className="burger-bar"></span>
            <span className="burger-bar"></span>
          </button>
        </div>
      </div>

      <nav className={`nav ${isOpen ? "nav--open" : "nav--closing"}`}>
        <ul className="nav__list nav__list--menu">
          <li
            className="nav__item nav-phone--mobile nav__item--mobile"
            onClick={closeMenu}
          >
            <a
              className="nav__item-link nav__item-link--phone"
              href="tel:+12344555656"
            >
              <span>+1 (234) 455 56-56</span>
              <img className="nav__icon" src={phoneIcon} alt="phone icon" />
            </a>
          </li>
          <li className="nav__list-item nav__item--mobile" onClick={closeMenu}>
            <Link className="nav__item-link" to="/contact">
              Help & Contact
            </Link>
          </li>
          <li className="nav__list-item" onClick={closeMenu}>
            <Link className="nav__item-link" to="/about">
              About us
            </Link>
          </li>
          <li className="nav__list-item  nav__currency">
            <CustomSelect
              options={currencyOptions}
              value={selectedCurrency}
              onChange={handleCurrencyChange}
              placeholder="Select Currency"
              hidePlaceholder={true}
              className="select-currency"
              optionsClassName="options-currency"
            />
          </li>
          <li className="nav__list-item" onClick={closeMenu}>
            <Link to="/wishlist" className="nav__item-link">
              {isOpen && <span className="wishlist-text">Wishlist</span>}
              <img className="wishlist-icon" src={saveIcon} alt="heart icon" />
            </Link>
          </li>
          <li className="nav__list-item" onClick={closeMenu}>
            <Link className="nav__item-link nav__item-link--cart" to="/cart">
              {isOpen && <span className="cart-text">Cart</span>}
              <img
                src={cartIcon}
                alt="icon shopping cart"
                className="cart-icon"
              />
              {totalBookings > 0 && (
                <div className="cart-notification">{totalBookings}</div>
              )}
            </Link>
          </li>
          {isLoggedIn ? (
            <li className="nav__list-item manage-bookings">
              <div ref={ref} className="dropdown-wrapper btn--dropdown">
                <div onClick={toggleDropdown} className="btn nav__item-link ">
                  <div className="nav-hamburger">
                    <img
                      className="nav-hamburger__icon"
                      src={HamburgerIcon}
                      alt="Hamburger Icon"
                    />
                    <div className="nav-hamburger__text">
                      <span>My Account</span>
                      {isComponentVisible ? (
                        <Icon iconPath={iconArrowUp} />
                      ) : (
                        <Icon iconPath={iconArrowDown} />
                      )}
                    </div>
                  </div>

                  <div className="user-avatar btn--manage-bookings">
                    <div className="user-avatar-initials">
                      {getInitials(user?.first_name, user?.last_name)}
                    </div>
                  </div>
                  <div className="user-avatar__menu">
                    <span>My Account</span>
                    {isComponentVisible ? (
                      <Icon iconPath={iconArrowUp} />
                    ) : (
                      <Icon iconPath={iconArrowDown} />
                    )}
                  </div>
                </div>
                <ul
                  className={`dropdown-menu ${
                    isComponentVisible && "dropdown--visible"
                  }`}
                >
                  <li
                    className="dropdown-item bookings-cart-wrp"
                    onClick={closeDropdown}
                  >
                    <Link to="/cart">Cart</Link>
                    <div className="bookings-cart"></div>
                  </li>
                  <li
                    className="dropdown-item bookings-notification-wrp"
                    onClick={closeDropdown}
                  >
                    <Link to="/bookings">My Bookings</Link>
                  </li>
                  <li className="dropdown-item" onClick={closeDropdown}>
                    <Link to="/account">Account</Link>
                  </li>
                  <li className="dropdown-item" onClick={closeDropdown}>
                    <Button className="btn btn--logout" onClick={handleLogout}>
                      Sign out <Icon iconPath={iconSignout} />
                    </Button>
                  </li>
                </ul>
              </div>
            </li>
          ) : (
            <li className="nav__list-item" onClick={closeMenu}>
              <Link className="nav__item-link" to="/login">
                Sign in
              </Link>
            </li>
          )}
        </ul>
        <ul className="nav__list nav__list--categories">
          <li className="nav__item" onClick={closeMenu}>
            <Link className="nav__item-link" to="/">
              Home
            </Link>
          </li>
          <li className="nav__item" onClick={closeMenu}>
            <Link className="nav__item-link" to="/tours">
              All tours
            </Link>
          </li>
          <li className="nav__list-item" onClick={closeMenu}>
            <Link className="nav__item-link" to="/destinations">
              Destinations
            </Link>
          </li>

          <li className="nav__list-item" onClick={closeMenu}>
            <Link className="nav__item-link" to="/travel-guide">
              Travel Guide
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
