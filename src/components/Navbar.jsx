import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => setMobileOpen(!mobileOpen);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const links = [
    { name: "Requests", path: "/", roles: ["USER", "ADMIN"] },
    { name: "Volunteers", path: "/volunteers", roles: ["ADMIN"] },
    { name: "Users", path: "/users", roles: ["ADMIN"] },
    { name: "Dashboard", path: "/dashboard", roles: ["ADMIN"] },
  ];

  return (
    <nav className="bg-blue-600 text-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="shrink-0">
            <Link to="/" className="text-2xl font-bold">CommunityHub</Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-6 items-center">
            {user &&
              links
                .filter(link => link.roles.includes(user.role))
                .map(link => (
                  <Link key={link.name} to={link.path} className="hover:text-yellow-300 transition">
                    {link.name}
                  </Link>
                ))
            }
            {user && (
              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMobileMenu} className="focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"
                   viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-blue-500 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user &&
                links
                  .filter(link => link.roles.includes(user.role))
                  .map(link => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded hover:bg-blue-600 transition"
                    >
                      {link.name}
                    </Link>
                  ))
              }
              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full text-left bg-red-500 px-3 py-2 rounded hover:bg-red-600 transition"
                >
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
