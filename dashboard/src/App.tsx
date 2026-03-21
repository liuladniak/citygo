import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import { RequireManager } from "./components/RequireManager";
import Analytics from "./pages/Analytics/Analytics";
import AddBooking from "./pages/AddBooking/AddBooking";
import AddTour from "./pages/AddTour/AddTour";
import BookingDetails from "./pages/BookingDetails";
import Bookings from "./pages/Bookings/Bookings";
import Dashboard from "./pages/Dashboard/Dashboard";
import EditTourPage from "./pages/TourDetails/EditTourPage";
import Guests from "./pages/Guests/Guests";
import Schedule from "./pages/Schedule/Schedule";
import SettingsPage from "./pages/Settings/Settings";
import TasksPage from "./pages/Tasks/Tasks";
import Team from "./pages/Team/Team";
import TourDetails from "./pages/TourDetails/TourDetails";
import Tours from "./pages/Tours/Tours";
import UnderConstruction from "./pages/UnderConstruction/UnderConstruction";
import "./App.css";
import "../src/styles/fonts.css";

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
        element: (
          <RequireManager>
            <Analytics />
          </RequireManager>
        ),
      },
      {
        path: "/bookings",
        element: <Bookings />,
      },
      {
        path: "/bookings/:bookingId",
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
        element: <Schedule />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
        path: "/tasks",
        element: <TasksPage />,
      },
      {
        path: "/team",
        element: (
          <RequireManager>
            <Team />
          </RequireManager>
        ),
      },
      {
        path: "/guests",
        element: (
          <RequireManager>
            <Guests />
          </RequireManager>
        ),
      },
      { path: "/tours", element: <Tours /> },
      {
        path: "/tours/:slug",
        element: <TourDetails />,
      },

      {
        path: "/tours/:slug/edit",
        element: <EditTourPage />,
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
        element: <BookingDetails />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
