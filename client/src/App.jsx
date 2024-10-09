import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.scss";
import "./styles/partials/_globals.scss";
import AppLayout from "./components/AppLayout/AppLayout";
import Homepage from "./pages/Homepage/Homepage";
import Tours from "./pages/Tours/Tours";
import Tour from "./pages/Tour/Tour";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import ManageBookings from "./pages/ManageBookings/ManageBookings";
import Cart from "./pages/Cart/Cart";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Homepage />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/tours",
        element: <Tours />,
      },
      {
        path: "/tours/:id",
        element: <Tour />,
      },
      { path: "/bookings", element: <ManageBookings /> },
      { path: "/cart", element: <Cart /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
