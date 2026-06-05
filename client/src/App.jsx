import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./styles/partials/_globals.scss";
import "./styles/main.css";
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
import AuthCallback from "./pages/AuthCallback/AuthCallback";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import Success from "./pages/Success/Success";
import Article from "./pages/Article/Article";
import CheckoutForm from "./pages/Cart/CheckoutForm";
import SpiceExperience from "./pages/Experience/SpiceExperience";
import HamamExperience from "./pages/Experience/HamamExperience";
import CustomItinerary from "./pages/CustomItinerary/CustomItinerary";
import FoodExperience from "./pages/Experience/FoodExperience";
import CookiePolicy from "./pages/CookiePolicy/CookiePolicy";
import Careers from "./pages/Careers/Careers";
import CareerDetail from "./pages/Careers/CareerDetail";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Homepage />,
      },
      { path: "/auth/callback", element: <AuthCallback /> },

      { path: "/reset-password", element: <ResetPassword /> },
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
      { path: "/checkout", element: <CheckoutForm /> },
      { path: "/experiences/spices", element: <SpiceExperience /> },
      { path: "/experiences/hammam", element: <HamamExperience /> },
      { path: "/experiences/food", element: <FoodExperience /> },
      { path: "/custom-itinerary", element: <CustomItinerary /> },
      { path: "/cookie-policy", element: <CookiePolicy /> },
      { path: "/careers", element: <Careers /> },
      { path: "/careers/:slug", element: <CareerDetail /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
