import { useEffect, useState } from "react";
import "./Breadcrumbs.scss";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const breadcrumbNames = {
  tours: "All Tours",
  category: "Categories",
  cart: "Cart",
  bookings: "My Bookings",
  account: "My Account",
  wishlist: "Wishlist",
  contact: "Help & Contact",
  about: "About Us",
  destinations: "Destinations",
  "travel-guide": "Travel Guide",
  success: "Booking Confirmed",
};

const getBreadcrumbName = (value, tourName) => {
  return breadcrumbNames[value] || tourName || value.replace(/-/g, " ");
};

const Breadcrumbs = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const [tourName, setTourName] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 480);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 480);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const pathnames = location.pathname.split("/").filter((x) => x);
    const isTourDetailPage = pathnames[0] === "tours" && pathnames.length === 2;

    if (isTourDetailPage) {
      const slug = pathnames[1];
      axios
        .get(`${API_URL}/api/tours/${slug}`)
        .then((res) => setTourName(res.data.tour_name))
        .catch((err) => console.error("Error fetching tour name:", err));
    } else {
      setTourName("");
    }
  }, [location.pathname, API_URL]);

  if (pathnames.length === 0) return null;

  return (
    <nav className="breadcrumb-nav" aria-label="breadcrumb">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link to="/">Home</Link>
        </li>
        {isMobile ? (
          <>
            <li className="breadcrumb-item">...</li>
            <li className="breadcrumb-item active" aria-current="page">
              {tourName || getBreadcrumbName(pathnames[pathnames.length - 1])}
            </li>
          </>
        ) : (
          pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;
            return (
              <li key={to} className="breadcrumb-item">
                {!isLast ? (
                  <Link to={to}>{getBreadcrumbName(value)}</Link>
                ) : (
                  <span className="active" aria-current="page">
                    {getBreadcrumbName(value, tourName)}
                  </span>
                )}
              </li>
            );
          })
        )}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
