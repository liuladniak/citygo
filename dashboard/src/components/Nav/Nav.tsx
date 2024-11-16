import { Link } from "react-router-dom";
import homeIcon from "../../assets/icons/home.svg";
import scheduleIcon from "../../assets/icons/schedule.svg";
import bookingsIcon from "../../assets/icons/booking.svg";
import teamIcon from "../../assets/icons/team.svg";
import toursIcon from "../../assets/icons/tour.svg";
import analyticsIcon from "../../assets/icons/analytics.svg";
import invoicesIcon from "../../assets/icons/receipt_long.svg";
import tasksIcon from "../../assets/icons/task.svg";
import reportsIcon from "../../assets/icons/report.svg";
import guestsIcon from "../../assets/icons/person_search.svg";
import settingsIcon from "../../assets/icons/settings.svg";

import "./Nav.css";

const Nav = () => {
  return (
    <aside className="main-nav">
      <div className="logo">CityGo</div>
      <nav className="nav">
        <ul className="nav-list">
          <li className="nav-item">
            <Link className="nav-link" to="/">
              <img className="nav-icon" src={homeIcon} alt="home icon" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link className="nav-link" to="/schedule">
              <img className="nav-icon" src={scheduleIcon} alt="clock icon" />
              <span>Schedule</span>
            </Link>
          </li>
          <li>
            <Link className="nav-link" to="/bookings">
              <img className="nav-icon" src={bookingsIcon} alt="ticket icon" />
              <span>Bookings</span>
            </Link>
          </li>
          <li>
            <Link className="nav-link" to="/team">
              <img className="nav-icon" src={teamIcon} alt="group icon" />
              <span>Team</span>
            </Link>
          </li>
          <li>
            <Link className="nav-link" to="/tours">
              <img className="nav-icon" src={toursIcon} alt="flag icon" />
              <span>Tours</span>
            </Link>
          </li>
          <li>
            <Link className="nav-link" to="/analytics">
              <img
                className="nav-icon"
                src={analyticsIcon}
                alt="diagram icon"
              />
              <span>Analytics</span>
            </Link>
          </li>
          <li>
            <Link className="nav-link" to="/invoices">
              <img className="nav-icon" src={invoicesIcon} alt="invoice icon" />
              <span>Invoices</span>
            </Link>
          </li>
          <li>
            <Link className="nav-link" to="/tasks">
              <img className="nav-icon" src={tasksIcon} alt="task icon" />
              <span>Tasks</span>
            </Link>
          </li>
          <li>
            <Link className="nav-link" to="/reports">
              <img className="nav-icon" src={reportsIcon} alt="report icon" />
              <span>Reports</span>
            </Link>
          </li>
          <li>
            <Link className="nav-link" to="/guests">
              <img
                className="nav-icon"
                src={guestsIcon}
                alt="person with a magnifying glass icon"
              />
              <span>Guests lookup</span>
            </Link>
          </li>
          <li>
            <Link className="nav-link" to="/settings">
              <img
                className="nav-icon"
                src={settingsIcon}
                alt="settings icon"
              />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Nav;
