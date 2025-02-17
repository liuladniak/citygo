import Icon from "../../components/UI/Icon";
import {
  iconBell,
  iconPayment,
  iconPerson,
  iconTicket,
} from "../../components/UI/iconsPaths";
import "./Account.scss";
import Tab1Content from "../../components/TabContent/Tab1Content";
import Tab2Content from "../../components/TabContent/Tab2Content";
import Tab3Content from "../../components/TabContent/Tab3Content";
import Tab4Content from "../../components/TabContent/Tab4Content";

import Tabs from "../../components/Tabs/Tabs";
import { useEffect, useState } from "react";
import Button from "../../components/Button/Button";
import axios from "axios";

const Account = () => {
  const [failedAuth, setFailedAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const API_URL = import.meta.env.VITE_API_KEY;

  const login = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return setFailedAuth(true);
    }

    try {
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      setUser(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setFailedAuth(true);
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setFailedAuth(true);
  };

  useEffect(() => {
    login();
  }, []);

  if (failedAuth) {
    return (
      <main className="dashboard dashboard--not-logged">
        <h1 className="">You must be logged in to see this page.</h1>
        <p>
          <Button className="btn btn--login" to="/login">
            Log in
          </Button>
        </p>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="dashboard">
        <p>Loading...</p>
      </main>
    );
  }

  const tabsData = [
    {
      label: "Personal Info",
      content: <Tab1Content user={user} />,
      icon: () => <Icon iconPath={iconPerson} />,
    },
    {
      label: "My bookings",
      content: <Tab2Content user={user} />,
      icon: () => <Icon iconPath={iconTicket} />,
    },
    {
      label: "Payment details",
      content: <Tab3Content user={user} />,
      icon: () => <Icon iconPath={iconPayment} />,
    },
    {
      label: "Notifications",
      content: <Tab4Content user={user} />,
      icon: () => <Icon iconPath={iconBell} />,
    },
  ];
  return (
    <div className="account">
      <h3 className="account-heading">Account Information</h3>
      <div className="account-cols">
        <Tabs tabs={tabsData} user={user} />
      </div>
    </div>
  );
};

export default Account;
