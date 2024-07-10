import "./Dashboard.scss";
import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [failedAuth, setFailedAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const login = async () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      return setFailedAuth(true);
    }

    try {
      const response = await axios.get("http://localhost:8080/auth/profile", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      setUser(response.data);
    } catch (error) {
      console.error(error);
      setFailedAuth(true);
    }

    setIsLoading(false);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
    setFailedAuth(true);
  };

  useEffect(() => {
    login();
  }, []);

  if (failedAuth) {
    return (
      <main className="dashboard">
        <p>You must be logged in to see this page.</p>
        <p>
          <Link to="/login">Log in</Link>
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

  return (
    <main className="dashboard">
      <h1 className="dashboard__title">Dashboard</h1>

      <p>
        Welcome back, {user.first_name} {user.last_name}
      </p>

      <h2>My Profile</h2>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phone}</p>
      <p>Address: {user.address}</p>

      <button className="dashboard__logout" onClick={logout}>
        Log out
      </button>
    </main>
  );
}

export default Dashboard;
