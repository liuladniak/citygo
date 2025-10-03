import { Link, NavLink } from "react-router-dom";

import {
  busIconPath,
  lockIconPath,
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
  dockToLeft,
} from "../ui/SVGIcons/iconPaths";

import "./Nav.css";
import Icon from "../ui/SVGIcons/Icon";
import { useState } from "react";

const navItems = [
  { path: "/", label: "Dashboard", iconPath: homeIconPath },
  { path: "/tours", label: "Tours", iconPath: toursIconPath },
  {
    path: "/schedule",
    label: "Schedule",
    iconPath: scheduleIconPath,
    lockIcon: lockIconPath,
  },
  {
    path: "/bookings",
    label: "Bookings",
    iconPath: bookingsIconPath,
    lockIcon: lockIconPath,
  },
  {
    path: "/team",
    label: "Team",
    iconPath: teamIconPath,
    lockIcon: lockIconPath,
  },
  {
    path: "/analytics",
    label: "Analytics",
    iconPath: analyticsIconPath,
    lockIcon: lockIconPath,
  },
  {
    path: "/invoices",
    label: "Invoices",
    iconPath: invoicesIconPath,
    lockIcon: lockIconPath,
  },
  {
    path: "/tasks",
    label: "Tasks",
    iconPath: tasksIconPath,
    lockIcon: lockIconPath,
  },
  {
    path: "/reports",
    label: "Reports",
    iconPath: reportsIconPath,
    lockIcon: lockIconPath,
  },
  {
    path: "/guests",
    label: "Guests",
    iconPath: guestsIconPath,
    lockIcon: lockIconPath,
  },
  {
    path: "/settings",
    label: "Settings",
    iconPath: settingsIconPath,
    lockIcon: lockIconPath,
  },
];

const Nav = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={` main-nav text-mediumGray flex flex-col h-screen border-r transition-all duration-300 ease-in-out 

        ${collapsed ? "w-16" : "w-56"}`}
    >
      <div className="p-4 border-b flex gap-4">
        <Link to="/" className="logo flex items-center gap-3 text-darkGray">
          {/* <div className="flex items-center gap-3 text-darkGray "> */}
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center relative group">
            <Icon
              iconPath={busIconPath}
              className={`fill-white transition-opacity duration-200 ${
                collapsed ? "group-hover:opacity-0" : ""
              }`}
              size={20}
            />
            {/* </div> */}
            {/* 
            <div
              className={`flex flex-col transition-opacity duration-300 ${
                collapsed ? "hidden" : "opacity-100 w-auto"
              }`}
            >
              <h2 className="font-semibold text-gray-900 whitespace-nowrap">
                CityGo
              </h2>
              <p className="text-xs text-gray-500 capitalize">Admin Panel</p>
            </div> */}

            {collapsed && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCollapsed(false);
                }}
                aria-label="Expand sidebar"
                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icon iconPath={dockToLeft} size={16} className="fill-white" />
              </button>
            )}
          </div>

          {/* {!collapsed && ( */}
          <div
            className={`flex flex-col overflow-hidden whitespace-nowrap transition-opacity duration-300 ${
              collapsed
                ? "opacity-0 w-0 pointer-events-none"
                : "opacity-100 w-auto"
            }`}
          >
            <h2 className="font-semibold text-gray-900">CityGo</h2>
            <p className="text-xs text-gray-500 capitalize">Admin Panel</p>
          </div>
          {/* )} */}
        </Link>
        {/* <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 w-7 h-7 [&_svg]:shrink-0 flex items-center justify-center"
        >
          <Icon
            iconPath={dockToLeft}
            size={18}
            className=" hover:bg-gray-100 rounded-lg hover:text-accent-foreground  transition-colors fill-stone-600 "
          />
        </button> */}

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-2 w-7 h-7 flex items-center justify-center  "
          >
            <Icon
              iconPath={dockToLeft}
              size={18}
              className="hover:bg-gray-100 rounded-lg transition-colors fill-stone-600 shrink-0"
            />
          </button>
        )}
      </div>
      <nav className="nav overflow-auto flex-1 min-h-0 p-4">
        <ul className="flex flex-col gap-1 text-sm font-medium">
          {navItems.map(({ lockIcon, path, label, iconPath }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-md w-full transition-colors    
                  ${
                    isActive
                      ? "hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
                      : "hover:bg-gray-200 text-gray-600"
                  }`
                }
              >
                {({ isActive }) => (
                  <div
                    className={` ${
                      collapsed ? "" : "w-full"
                    }  rounded-md h-8 text-sm flex items-center gap-3 px-3 py-2  ${
                      lockIcon ? "text-muted" : "text-light-gray-600"
                    }  ${isActive ? "bg-gray-200 text-gray-600" : ""}`}
                  >
                    <Icon
                      iconPath={iconPath}
                      size={16}
                      className={`transition-colors duration-200  shrink-0 ${
                        lockIcon ? "fill-muted" : "fill-light-gray-600"
                      }`}
                    />
                    {!collapsed && (
                      <>
                        <span className="self-start">{label}</span>
                        {lockIcon && (
                          <Icon
                            iconPath={lockIconPath}
                            size={15}
                            className="transition-colors duration-200 fill-muted"
                          />
                        )}
                      </>
                    )}
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t ">
        <div className="flex items-center p-4">
          <div className="rounded-full w-8 h-8 bg-red-100 flex items-center justify-center">
            <span className="bg-travel-100 text-red-700">Z</span>
          </div>
          <div className="flex flex-col ml-[12px]">
            <div className="text-sm font-medium text-gray-900 truncate">
              Zeynep Demir
            </div>
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 text-xs bg-red-100 text-red-800">
              <span>Admin</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Nav;
