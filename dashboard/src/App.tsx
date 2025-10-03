import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import "../src/styles/fonts.css";
import AppLayout from "./components/AppLayout/AppLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
// import Analytics from "./pages/Analytics/Analytics";
// import Bookings from "./pages/Bookings/Bookings";
// import Invoices from "./pages/Invoices/Invoices";
// import Reports from "./pages/Reports/Reports";
// import Schedule from "./pages/Schedule/Schedule";
// import Settings from "./pages/Settings/Settings";
// import Tasks from "./pages/Tasks/Tasks";
// import Team from "./pages/Team/Team";
import Tours from "./pages/Tours/Tours";
// import Guests from "./pages/Guests/Guests";
import TourDetails from "./pages/TourDetails/TourDetails";
import AddTour from "./pages/AddTour/AddTour";
import UnderConstruction from "./pages/UnderConstruction/UnderConstruction";
import AddBooking from "./pages/AddBooking/AddBooking";
import SingleBooking from "./pages/SingleBooking/SingleBooking";
import Bookings from "./pages/Bookings/Bookings";
import BookingDetails from "./pages/BookingDetails";
import Analytics from "./pages/Analytics/Analytics";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/analytics",
        element: <Analytics />,
      },
      {
        path: "/bookings",
        element: <Bookings />,
      },
      {
        path: "/bookings/1",
        element: <BookingDetails />,
      },
      {
        path: "/invoices",
        element: <UnderConstruction />,
      },
      {
        path: "/reports",
        element: <UnderConstruction />,
      },
      {
        path: "/schedule",
        element: <UnderConstruction />,
      },
      {
        path: "/settings",
        element: <UnderConstruction />,
      },
      {
        path: "/tasks",
        element: <UnderConstruction />,
      },
      {
        path: "/team",
        element: <UnderConstruction />,
      },
      {
        path: "/guests",
        element: <UnderConstruction />,
      },
      {
        path: "/tours",
        element: <Tours />,
      },
      {
        path: "/tours/:slug",
        element: <TourDetails />,
      },

      {
        path: "/tours/:slug/edit",
        element: <TourDetails />,
      },
      {
        path: "/tours/add",
        element: <AddTour />,
      },
      {
        path: "/booking/add",
        element: <AddBooking />,
      },
      {
        path: "/booking/:slug",
        element: <SingleBooking />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
