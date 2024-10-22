import { useEffect, useState } from "react";
import "./Breadcrumbs.scss";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../utils/api";

const breadcrumbNames = {
  tours: "All Tours",
  category: "Categories",
  cart: "Cart",
};

const getBreadcrumbName = (value, tourName) => {
  return breadcrumbNames[value] || tourName || value.replace(/-/g, " ");
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const [tourName, setTourName] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 480);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 480);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const tourSlug = pathnames[pathnames.length - 1];

    if (tourSlug && !tourName) {
      fetchTourName(tourSlug);
    }
  }, [location, pathnames, tourName]);

  const fetchTourName = async (slug) => {
    try {
      const response = await axios.get(`${API_URL}/api/tours/${slug}`);
      setTourName(response.data.tour_name);
    } catch (error) {
      console.error("Error fetching tour name:", error);
    }
  };

  if (pathnames.length === 0) {
    return null;
  }

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
              {tourName}
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
