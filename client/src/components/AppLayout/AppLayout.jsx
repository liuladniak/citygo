import "./AppLayout.scss";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Subscribe from "../Subscribe/Subscribe";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";

function AppLayout() {
  const location = useLocation();

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location]);
  return (
    <div className="layout">
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
