import { Link } from "react-router-dom";
import moreIcon from "../../assets/icons/more_vert.svg";
import notifIcon from "../../assets/icons/notifications.svg";
import userAvatar from "../../assets/images/user-avatar.jpg";

import "./UserNav.scss";

const UserNav = () => {
  return (
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
  );
};

export default UserNav;
