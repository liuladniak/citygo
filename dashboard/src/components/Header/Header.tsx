import "./Header.css";
import { Link } from "react-router-dom";
import moreIcon from "../../assets/icons/more_vert.svg";
import notifIcon from "../../assets/icons/notifications.svg";
import userAvatar from "../../assets/images/user-avatar.jpg";

const Header: React.FC<{ pageTitle: string }> = ({ pageTitle }) => {
  return (
    <header className="header">
      <h1 className="header__heading">{pageTitle}</h1>

      <section className="user-nav">
        <nav>
          <ul className="user-nav-list">
            <li className="user-nav-item">
              <Link className="user-nav-link" to="">
                USD
              </Link>
            </li>
            <li className="user-nav-item">
              <Link className="user-nav-link" to="">
                <img src={notifIcon} alt="bell icon" />
              </Link>
            </li>
            <li className="user-nav-item">
              <Link className="user-nav-link" to="">
                <span>Liu</span>
                <img className="user-img" src={userAvatar} alt="user avatar" />
              </Link>
            </li>
            <li className="user-nav-item">
              <Link className="user-nav-link" to="">
                <img src={moreIcon} alt="vertical dots icon" />
              </Link>
            </li>
          </ul>
        </nav>
      </section>
    </header>
  );
};

export default Header;
