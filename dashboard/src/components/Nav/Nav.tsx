import { Link, NavLink } from "react-router-dom";

import {
  homeIconPath,
  scheduleIconPath,
  bookingsIconPath,
  teamIconPath,
  toursIconPath,
  analyticsIconPath,
  invoicesIconPath,
  tasksIconPath,
  reportsIconPath,
  guestsIconPath,
  settingsIconPath,
} from "../ui/SVGIcons/iconPaths";

import "./Nav.css";
import Icon from "../ui/SVGIcons/Icon";

const navItems = [
  { path: "/", label: "Dashboard", iconPath: homeIconPath },
  { path: "/schedule", label: "Schedule", iconPath: scheduleIconPath },
  { path: "/bookings", label: "Bookings", iconPath: bookingsIconPath },
  { path: "/team", label: "Team", iconPath: teamIconPath },
  { path: "/tours", label: "Tours", iconPath: toursIconPath },
  { path: "/analytics", label: "Analytics", iconPath: analyticsIconPath },
  { path: "/invoices", label: "Invoices", iconPath: invoicesIconPath },
  { path: "/tasks", label: "Tasks", iconPath: tasksIconPath },
  { path: "/reports", label: "Reports", iconPath: reportsIconPath },
  { path: "/guests", label: "Guests lookup", iconPath: guestsIconPath },
  { path: "/settings", label: "Settings", iconPath: settingsIconPath },
];

const Nav = () => {
  return (
    <aside className="w-56 bg-gray4 p-4 main-nav text-mediumGray ">
      <Link
        to="/"
        className="logo text-darkGray mb-4  text-xl pb-5 block font-medium"
      >
        CityGo
      </Link>
      <nav className="nav ">
        <ul className="nav-list">
          {navItems.map(({ path, label, iconPath }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-md w-full
                  ${
                    isActive
                      ? "hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
                      : "hover:bg-gray-200 text-gray-600"
                  }`
                }
              >
                {({ isActive }) => (
                  <div
                    className={`w-full flex gap-2 rounded-md py-1 px-2 ${
                      isActive ? "bg-gray-200 text-gray-600" : ""
                    }`}
                  >
                    <Icon
                      iconPath={iconPath}
                      fill="light-gray-600"
                      size={20}
                      className="transition-colors duration-200"
                    />
                    <span>{label}</span>
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Nav;
