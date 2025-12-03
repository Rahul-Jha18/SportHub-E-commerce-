import { createContext, useState, useContext } from "react";
import api from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sporthub_user")) || null;
    } catch {
      return null;
    }
  });

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setAuth(res.data);
    localStorage.setItem("sporthub_user", JSON.stringify(res.data));
  };

  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    setAuth(res.data);
    localStorage.setItem("sporthub_user", JSON.stringify(res.data));
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem("sporthub_user");
  };

  return (
    <AuthContext.Provider value={{ auth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
