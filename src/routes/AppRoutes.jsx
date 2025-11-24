// src/AppRoutes.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Requests from "../pages/Requests.jsx";
import Volunteers from "../pages/Volunteers.jsx";
import Users from "../pages/Users.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import NotFound from "../pages/NotFound.jsx";

export default function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  const ProtectedRoute = ({ children, roles }) => {
    if (!isAuthenticated()) {
      console.log("🔒 Route protected - redirecting to login");
      return <Navigate to="/login" replace />;
    }
    
    if (roles && user && !roles.includes(user.role)) {
      console.log("🚫 Insufficient permissions - user role:", user.role, "required roles:", roles);
      return <Navigate to="/" replace />;
    }
    
    return children;
  };

  const PublicRoute = ({ children }) => {
    if (isAuthenticated()) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
        <Route path="/volunteers" element={<ProtectedRoute roles={["ADMIN"]}><Volunteers /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute roles={["ADMIN"]}><Users /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute roles={["ADMIN"]}><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}