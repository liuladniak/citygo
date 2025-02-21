import "./AppLayout.scss";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Subscribe from "../Subscribe/Subscribe";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import Banner from "../Banner/Banner";
import { useDispatch } from "react-redux";
import { checkToken } from "../../features/auth/authSlice";

function AppLayout() {
  const location = useLocation();

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location]);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkToken());
  }, [dispatch]);

  return (
    <div className="layout">
      <Banner />
      <Header />
      <Breadcrumbs />
      <main className="main">
        <Outlet />
        <Subscribe />
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;
