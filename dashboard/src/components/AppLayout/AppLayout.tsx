import "./AppLayout.css";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Nav from "../Nav/Nav";
import Header from "../Header/Header";

function AppLayout() {
  const location = useLocation();

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location]);

  return (
    <div className="layout">
      <Nav />
      <main className="main bg-white rounded-md flex flex-col">
        <Header pageTitle="" />
        <div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;
