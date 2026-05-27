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
import axios from "axios";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import PageLoader from "../../components/UI/PageLoader";

const Account = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;
  const { session, isChecking } = useRequireAuth();

  useEffect(() => {
    if (!session) return;
    const loadProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        setUser(response.data);
        await fetchBookings(response.data.id, session.access_token);
      } catch {
        // profile fetch failed
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [session]);

  const fetchBookings = async (userId, token) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/bookings?userId=${userId}`,
        {
          headers: { Authorization: "Bearer " + token },
        },
      );
      setBookings(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (isChecking || isLoading) {
    return (
      <main className="dashboard">
        <PageLoader />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="dashboard">
        <p className="loading">Failed to load profile. Please refresh.</p>
      </main>
    );
  }

  const tabsData = [
    {
      label: "Personal Info",
      content: <Tab1Content user={user} session={session} />,
      icon: () => <Icon iconPath={iconPerson} />,
    },
    {
      label: "My bookings",
      content: <Tab2Content user={user} bookings={bookings} />,
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
