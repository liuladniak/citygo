import "./AppLayout.scss";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Outlet } from "react-router-dom";

function AppLayout() {
  return (
    <div className="layout">
      <Header />
      <div>
        <main className="main">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default AppLayout;
