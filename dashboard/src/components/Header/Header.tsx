import "./Header.css";
import { Link } from "react-router-dom";
import moreIcon from "../../assets/icons/more_vert.svg";
import notifIcon from "../../assets/icons/notifications.svg";
import userAvatar from "../../assets/images/user-avatar.jpg";
import { calenderIconPath } from "../ui/SVGIcons/iconPaths";
import Icon from "../ui/SVGIcons/Icon";
import Input from "../ui/Input/Input";
import { useState } from "react";

const Header: React.FC<{ pageTitle: string }> = ({ pageTitle }) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="header">
      {/* <h1 className="header__heading">{pageTitle}</h1> */}
      <div className="w-full flex-1">
        <Input
          name="search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="w-full flex-1 "
        />
      </div>

      <section className="user-nav flex-1">
        <nav>
          <ul className="user-nav-list">
            <li className="user-nav-item">
              <Link className="user-nav-link" to="">
                <Icon iconPath={calenderIconPath} fill="" />
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
