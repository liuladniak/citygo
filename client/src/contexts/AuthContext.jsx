import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isLoggedIn: !!sessionStorage.getItem("token"),
  });

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      setAuth({ isLoggedIn: true });
    } else {
      setAuth({ isLoggedIn: false });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
