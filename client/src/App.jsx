import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.scss";
import "./styles/partials/_globals.scss";
import AppLayout from "./components/AppLayout/AppLayout";
import Homepage from "./pages/Homepage/Homepage";
import Tours from "./pages/Tours/Tours";
import Tour from "./pages/Tour/Tour";
// import Cart from "./components/Cart/Cart";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Homepage />,
      },
      {
        path: "/tours",
        element: <Tours />,
      },
      {
        path: "/tours/:tourId",
        element: <Tour />,
      },
      // { path: "/cart", element: <Cart /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
