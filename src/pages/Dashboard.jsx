import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axiosInstance from "../api/axiosInstance";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalVolunteers: 0,
    totalUsers: 0,
  });

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get("/admin/dashboard-stats");
      setStats(res.data);
    } catch (err) {
      console.log("Dashboard Error:", err.response?.data || err);
    }
  };

 useEffect(() => {
  fetchStats();               
  const interval = setInterval(fetchStats, 5000);  

  return () => clearInterval(interval);
}, []);


  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">

      {/* 🔵 NAVBAR ADDED */}
      <Navbar />

      <main className="grow p-6 pt-24">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">

          {/* Requests Card */}
          <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl text-center">
            <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Total Requests
            </h2>
            <p className="text-4xl font-bold text-blue-600">
              {stats.totalRequests}
            </p>
          </div>

          {/* Volunteers Card */}
          <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl text-center">
            <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Total Volunteers
            </h2>
            <p className="text-4xl font-bold text-green-600">
              {stats.totalVolunteers}
            </p>
          </div>

          {/* Users Card */}
          <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl text-center">
            <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Total Users
            </h2>
            <p className="text-4xl font-bold text-purple-600">
              {stats.totalUsers}
            </p>
          </div>

        </div>
      </main>

      {/* 🔵 FOOTER ADDED */}
      <Footer />
    </div>
  );
}
