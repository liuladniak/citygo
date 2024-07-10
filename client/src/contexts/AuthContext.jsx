import { useState, useEffect, createContext, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    axios
      .get("http://localhost:8080/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUser(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      });
  }, []);

  const login = (userData, token) => {
    sessionStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
  };

  const authContextValue = {
    user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
