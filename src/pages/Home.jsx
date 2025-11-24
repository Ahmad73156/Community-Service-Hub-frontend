// src/pages/Home.jsx
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="grow bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
        <div className="text-center mt-10">
          <h1 className="text-4xl font-bold mb-4">Welcome to the Dashboard</h1>
          <p className="text-gray-600">You are successfully logged in!</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
