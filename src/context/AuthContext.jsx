// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance.js";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  const login = async (email, password) => {
    try {
      console.log("🔐 Attempting login for:", email);
      
      const res = await axiosInstance.post("/auth/login", { email, password });
      
      if (!res.data.token) {
        throw new Error("No token received from server");
      }

      console.log("✅ Login successful, token received");
      
      // Store token and user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setToken(res.data.token);
      setUser(res.data.user);

      toast.success("Login successful");
      return true;

    } catch (err) {
      console.error("❌ Login failed:", err);
      const errorMessage = err.response?.data || err.message || "Login failed";
      toast.error(errorMessage);
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      await axiosInstance.post("/auth/register", { name, email, password });
      toast.success("Registration successful");
      return true;
    } catch (err) {
      toast.error(err.response?.data || "Registration failed");
      return false;
    }
  };

  const logout = () => {
    console.log("🚪 Logging out user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    toast.success("Logged out");
  };

  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user);
  };

  // Validate token on app start
  useEffect(() => {
    const validateToken = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      
      if (token && user) {
        console.log("🔐 Token found on app start");
        setToken(token);
        setUser(JSON.parse(user));
      } else {
        console.log("❌ No token or user found on app start");
      }
    };

    validateToken();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout,
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);