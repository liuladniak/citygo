import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.scss";
import "./styles/partials/_globals.scss";
import AppLayout from "./components/AppLayout/AppLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Analytics from "./pages/Analytics/Analytics";
import Bookings from "./pages/Bookings/Bookings";
import Invoices from "./pages/Invoices/Invoices";
import Reports from "./pages/Reports/Reports";
import Schedule from "./pages/Schedule/Schedule";
import Settings from "./pages/Settings/Settings";
import Tasks from "./pages/Tasks/Tasks";
import Team from "./pages/Team/Team";
import Tours from "./pages/Tours/Tours";
import Guests from "./pages/Guests/Guests";
import TourDetails from "./pages/TourDetails/TourDetails";

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
        path: "/invoices",
        element: <Invoices />,
      },
      {
        path: "/reports",
        element: <Reports />,
      },
      {
        path: "/schedule",
        element: <Schedule />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/tasks",
        element: <Tasks />,
      },
      {
        path: "/team",
        element: <Team />,
      },
      {
        path: "/guests",
        element: <Guests />,
      },
      {
        path: "/tours",
        element: <Tours />,
      },
      {
        path: "/tours/:slug",
        element: <TourDetails />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
