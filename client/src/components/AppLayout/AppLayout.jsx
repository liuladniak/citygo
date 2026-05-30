// import "./AppLayout.scss";
// import Header from "../Header/Header";
// import Footer from "../Footer/Footer";
// import { useEffect } from "react";
// import { Outlet, useLocation } from "react-router-dom";
// import Subscribe from "../Subscribe/Subscribe";
// import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
// import Banner from "../Banner/Banner";
// import { useDispatch } from "react-redux";
// import { clearUser } from "../../features/auth/authSlice";
// import { fetchUserProfile } from "../../features/auth/authSlice";
// import { supabase } from "../../lib/supabaseClient";
// import MiloChat from "../MiloChat/MiloChat";

// function AppLayout() {
//   const location = useLocation();
//   const dispatch = useDispatch();

//   useEffect(() => {
//     document.documentElement.scrollTop = 0;
//     document.body.scrollTop = 0;
//   }, [location]);

//   useEffect(() => {
//     dispatch(fetchUserProfile());

//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((event, session) => {
//       if (session) {
//         dispatch(fetchUserProfile());
//       } else {
//         dispatch(clearUser());
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, [dispatch]);

//   return (
//     <div className="layout relative">
//       <Banner />
//       <Header />
//       <Breadcrumbs />
//       <main className="main">
//         <Outlet />
//         <Subscribe />
//       </main>
//       <Footer />
//       <MiloChat />
//     </div>
//   );
// }

// export default AppLayout;

import "./AppLayout.scss";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Subscribe from "../Subscribe/Subscribe";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import Banner from "../Banner/Banner";
import { useDispatch } from "react-redux";
import { clearUser } from "../../features/auth/authSlice";
import { fetchUserProfile } from "../../features/auth/authSlice";
import { supabase } from "../../lib/supabaseClient";
import MiloChat from "../MiloChat/MiloChat";
import CookieBanner from "../CookieBanner/CookieBanner";
import { useCookieConsent } from "../../hooks/useCookieConsent";

function AppLayout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { hasDecided, acceptAll, rejectAll, resetConsent } = useCookieConsent();

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location]);

  useEffect(() => {
    dispatch(fetchUserProfile());

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        dispatch(fetchUserProfile());
      } else {
        dispatch(clearUser());
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return (
    <div className="layout relative">
      <Banner />
      <Header />
      <Breadcrumbs />
      <main className="main">
        <Outlet />
        <Subscribe />
      </main>
      <Footer resetConsent={resetConsent} />
      <MiloChat />
      {!hasDecided && (
        <CookieBanner onAcceptAll={acceptAll} onRejectAll={rejectAll} />
      )}
    </div>
  );
}

export default AppLayout;
