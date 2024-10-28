import "./AppLayout.scss";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Nav from "../Nav/Nav";

function AppLayout() {
  const location = useLocation();

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location]);

  return (
    <div className="layout">
      <Nav />
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
