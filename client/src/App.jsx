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
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import Destinations from "./pages/Destinations/Destinations";
import TravelGuide from "./pages/TravelGuide/TravelGuide";
import Account from "./pages/Profile/Account";
import HelpContact from "./pages/HelpContact/HelpContact";
import About from "./pages/About/About";
import Wishlist from "./pages/Wishlist/Wishlist";

import Success from "./pages/Success/Success";
import Article from "./pages/Article/Article";

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
        path: "/account",
        element: <Account />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/wishlist",
        element: <Wishlist />,
      },
      {
        path: "/contact",
        element: <HelpContact />,
      },
      {
        path: "/travel-guide",
        element: <TravelGuide />,
      },
      { path: "/article/:slug", element: <Article /> },
      {
        path: "/tours/:slug",
        element: <Tour />,
      },
      { path: "/bookings", element: <ManageBookings /> },
      { path: "/cart", element: <Cart /> },
      { path: "/destinations", element: <Destinations /> },
      { path: "*", element: <NotFoundPage /> },

      { path: "/success", element: <Success /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
