import toast from "react-hot-toast";

// JWT token helpers
export const saveToken = (token) => localStorage.setItem("token", token);
export const getToken = () => localStorage.getItem("token");
export const removeToken = () => localStorage.removeItem("token");

// Toast helpers
export const notifySuccess = (msg) => toast.success(msg);
export const notifyError = (msg) => toast.error(msg);

// Validation helpers
export const isEmailValid = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
