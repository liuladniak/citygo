import "./Header.css";
import { Link } from "react-router-dom";
import notifIcon from "../../assets/icons/notifications.svg";
import Icon from "../ui/SVGIcons/Icon";
import Input from "../ui/Input/Input";
import { useState } from "react";
import DropdownWrapper from "../ui/DropdownWrapper";
import {
  chevronDownPath,
  dockToLeft,
  sunnyPath,
} from "../ui/SVGIcons/iconPaths";
const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const today = new Date();

  const month = today.toLocaleString("default", { month: "short" });
  const day = today.getDate();
  const weekday = today.toLocaleString("default", { weekday: "short" });

  return (
    <>
      <header className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4 ">
        <div className=" gap-4 flex items-center">
          {/* <button className="p-2 w-7 h-7 [&_svg]:shrink-0 flex items-center justify-center">
            <Icon
              iconPath={dockToLeft}
              size={18}
              className=" hover:bg-gray-100 rounded-lg hover:text-accent-foreground  transition-colors fill-stone-600 "
            />
          </button> */}
          <Input
            name="search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookings, guests, tours..."
            className="w-80 flex-1  "
          />
        </div>

        <section className="user-nav ">
          <nav>
            <ul className="user-nav-list">
              {/* <li className="user-nav-item flex items-center gap-2">
              <div className="flex ">
                <span>
                  {month} {day}, {weekday}
                </span>
              </div>

              <DropdownWrapper
                isOpen={openDropdown === "calendar"}
                onToggle={() => toggleDropdown("calendar")}
                trigger={
                  <Link className="user-nav-link" to="">
                    <Icon iconPath={calenderIconPath} fill="" />
                  </Link>
                }
              >
                <p>Calendar</p>
              </DropdownWrapper>
            </li> */}
              <li className="user-nav-item ">
                {" "}
                <DropdownWrapper
                  isOpen={openDropdown === "weather"}
                  onToggle={() => toggleDropdown("weather")}
                  trigger={
                    <button className=" bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md user-nav-link justify-center whitespace-nowrap text-sm font-medium h-10 flex items-center gap-2 p-4 hover:text-accent-foreground rounded-lg">
                      <Icon iconPath={sunnyPath} className="text-yellow-500" />

                      <div className="text-left">
                        <p className="font-semibold text-lg ">19°C</p>

                        <p className="text-xs text-blue-100 capitalize">
                          Sunny
                        </p>
                      </div>
                    </button>
                  }
                >
                  <ul className="text-warmBrown text-sm min-w-[310px]">
                    <li className="p-3 rounded-sm flex flex-col items-start hover:bg-gray-100 transition-colors cursor-pointer">
                      Option 1
                    </li>
                  </ul>
                </DropdownWrapper>
              </li>
              <li className="user-nav-item ">
                <DropdownWrapper
                  isOpen={openDropdown === "notification"}
                  onToggle={() => toggleDropdown("notification")}
                  trigger={
                    <Link className="user-nav-link relative" to="">
                      <div className="absolute top-1 right-1 mx-auto block h-2 w-2 rounded-full bg-red-700"></div>
                      <img className="" src={notifIcon} alt="bell icon" />
                    </Link>
                  }
                >
                  <ul className="text-warmBrown text-sm min-w-[310px]">
                    <h4 className="px-2 py-1.5 font-semibold mb-2  rounded-sm ">
                      Notifications
                    </h4>
                    <li className="p-3 rounded-sm flex flex-col items-start hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">
                          New booking received
                        </span>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-500">2 min ago</span>
                    </li>
                    <li className="p-3 rounded-sm flex flex-col items-start hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">Payment confirmed</span>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-500">15 min ago</span>
                    </li>
                    <li className="p-3 rounded-sm flex flex-col items-start hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">Tour guide assigned</span>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-500">1 hour ago</span>
                    </li>
                  </ul>
                </DropdownWrapper>
              </li>
              <li className="user-nav-item">
                <DropdownWrapper
                  isOpen={openDropdown === "status"}
                  onToggle={() => toggleDropdown("status")}
                  trigger={
                    <div className="top-2 right-2 rounded-md flex items-center bg-green-100 py-0.5 px-2.5 border border-transparent text-sm text-green-800 transition-all shadow-sm">
                      <div className="mx-auto block h-2 w-2 rounded-full bg-green-800 mr-2"></div>
                      Clocked in
                    </div>
                  }
                >
                  {" "}
                  <ul>
                    <li>Clock In</li>
                    <li>Meal Break</li>
                    <li>Clock Out</li>
                  </ul>
                </DropdownWrapper>
              </li>
              <li className="user-nav-item user-nav__status relative">
                <DropdownWrapper
                  isOpen={openDropdown === "profile"}
                  onToggle={() => toggleDropdown("profile")}
                  trigger={
                    <button className="user-nav-link justify-center whitespace-nowrap text-sm font-medium h-10 flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors hover:text-accent-foreground rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center relative">
                        <span className="text-white text-sm font-medium absolute top-[8px]">
                          TW
                        </span>
                      </div>

                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                          Tom Wilson
                        </p>
                        {/* <div className="top-2 right-2 rounded-md flex items-center bg-green-100 py-0.5 px-2.5 border border-transparent text-xs text-green-800 transition-all shadow-sm">
                          <div className="mx-auto block h-2 w-2 rounded-full bg-green-800 mr-2"></div>
                          Clocked in
                        </div> */}
                        <p className="text-xs text-gray-500">Admin</p>
                      </div>
                      <Icon iconPath={chevronDownPath} size={16} />
                    </button>
                  }
                >
                  <div className="text-warmBrown text-sm">
                    <div className="px-2 py-1.5 font-semibold mb-2 hover:bg-gray-100 rounded-sm transition-colors cursor-pointer">
                      <p className="font-medium"> Tom Wilson</p>
                      <p className=" text-gray-500">tomwilson@citygo.com</p>
                    </div>
                    <div className="px-2 py-1.5 rounded-sm hover:bg-gray-100 transition-colors cursor-pointer">
                      Profile Settings
                    </div>
                    <div className="px-2 py-1.5 rounded-sm hover:bg-gray-100 transition-colors cursor-pointer">
                      Preferences
                    </div>
                    <div className="px-2 py-1.5 rounded-sm mb-2 hover:bg-gray-100 transition-colors cursor-pointer">
                      Help & Support
                    </div>

                    <div className="px-2 py-1.5 rounded-sm text-red-600 hover:bg-gray-100 transition-colors cursor-pointer">
                      Sign Out
                    </div>
                  </div>
                </DropdownWrapper>
              </li>
              {/* <li className="user-nav-item"> */}
              {/* <DropdownWrapper
                isOpen={openDropdown === "more"}
                onToggle={() => toggleDropdown("more")}
                trigger={
                  <Link className="user-nav-link" to="">
                    <img src={moreIcon} alt="vertical dots icon" />
                  </Link>
                }
              >
                {" "}
                <ul>
                  <li>Settings</li>
                  <li>Help</li>
                  <li>Log out</li>
                </ul>
              </DropdownWrapper> */}
              {/* </li> */}
            </ul>
          </nav>
        </section>
      </header>
    </>
  );
};

export default Header;
