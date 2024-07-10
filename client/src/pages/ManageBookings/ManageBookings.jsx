import "./ManageBookings.scss";
import axios from "axios";
import { useState, useEffect } from "react";
import Button from "../../components/Button/Button";

function ManageBookings() {
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

  // const logout = () => {
  //   sessionStorage.removeItem("token");
  //   setUser(null);
  //   setFailedAuth(true);
  // };

  useEffect(() => {
    login();
  }, []);

  if (failedAuth) {
    return (
      <section className="login-dashboard">
        <h1>You must be logged in to see this page.</h1>
        <Button className="btn--login" to="/login">
          Log in
        </Button>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="dashboard">
        <p>Loading...</p>
      </section>
    );
  }

  return (
    <section className="dashboard">
      <h1 className="dashboard__title">
        Welcome back, {user.first_name} {user.last_name}
      </h1>

      <h2>Your reservations</h2>

      <div className="reservations"></div>
      {/* 
      <button className="dashboard__logout" onClick={logout}>
        Log out
      </button> */}
    </section>
  );
}

export default ManageBookings;
