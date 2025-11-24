// src/App.jsx
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          
          <main className="grow bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
            <AppRoutes />
          </main>
          
          <Footer />

          {/* Toast notifications */}
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 3000,
              style: { fontSize: "16px" }
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
