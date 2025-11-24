// src/api/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 30000, // 30 seconds
});

// Enhanced request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔐 Token attached to request:", config.url);
    } else {
      console.log("❌ No token found for request:", config.url);
    }
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ Response received:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ Response error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      console.log("🚨 401 Unauthorized - Clearing auth data");
      // localStorage.removeItem("token");
      // localStorage.removeItem("user");
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        // window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;