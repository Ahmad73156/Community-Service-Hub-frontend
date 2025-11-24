import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance.js";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    city: "",
    skills: "",
    role: "USER"
  });

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/users");
      console.log("Fetched users:", res.data);
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      if (err.response?.status === 403) {
        toast.error("Access denied: Only admins can view all users.");
      } else {
        toast.error("Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle edit user
  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      city: user.city || "",
      skills: user.skills || "",
      role: user.role || "USER"
    });
    setShowEditModal(true);
  };

  // Handle update user
  const handleUpdate = async () => {
    if (!editingUser) return;

    try {
      await axiosInstance.put(`/users/${editingUser.id}`, form);
      toast.success("User updated successfully!");
      setShowEditModal(false);
      setEditingUser(null);
      setForm({ name: "", email: "", city: "", skills: "", role: "USER" });
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error(err.response?.data || "Failed to update user");
    }
  };

  // Handle delete confirmation
  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Handle delete user
  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      await axiosInstance.delete(`/users/${userToDelete.id}`);
      toast.success("User deleted successfully!");
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error(err.response?.data || "Failed to delete user");
    }
  };

  // Check if current user can edit/delete a specific user
  const canModifyUser = (targetUser) => {
    if (!user) return false;
    // Admin can modify any user, regular users can only modify themselves
    return user.role === "ADMIN" || user.id === targetUser.id;
  };

  // Check if current user can change roles (admin only)
  const canChangeRole = () => {
    return user?.role === "ADMIN";
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  if (loading) return <Loader />;

  return (
    <>
    <Navbar/>
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <motion.h2
        className="text-3xl font-bold mb-6 text-center text-blue-600 mt-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        User Management
      </motion.h2>

      {/* Users Grid */}
      {users.length === 0 ? (
        <motion.p
          className="text-center text-gray-400 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          No users found
        </motion.p>
      ) : (
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {users.map((u) => (
            <motion.div
              key={u.id}
              className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="font-bold text-xl text-indigo-600 mb-2">{u.name}</h3>
              <p className="text-gray-700 dark:text-gray-200 mb-2">{u.email}</p>
              <p className={`text-sm font-semibold mb-2 ${
                u.role === 'ADMIN' ? 'text-red-500' : 
                u.role === 'VOLUNTEER' ? 'text-green-500' : 'text-blue-500'
              }`}>
                Role: {u.role}
              </p>
              
              {u.city && (
                <p className="text-sm text-gray-500 mb-1">City: {u.city}</p>
              )}
              
              {u.skills && (
                <p className="text-sm text-gray-500 mb-4">Skills: {u.skills}</p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                {canModifyUser(u) && (
                  <button
                    onClick={() => handleEdit(u)}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Edit
                  </button>
                )}
                
                {canModifyUser(u) && (
                  <button
                    onClick={() => confirmDelete(u)}
                    className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* View Profile Button (for all users) */}
              <button
                onClick={() => handleEdit(u)}
                className="w-full mt-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                View Profile
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-purple-600">
              {editingUser?.id === user?.id ? "Edit Your Profile" : "Edit User"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border text-white border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium  dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full p-2 border text-white border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  className="w-full p-2 border text-white border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Skills
                </label>
                <input
                  type="text"
                  className="w-full p-2 border text-white border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="Separate skills with commas"
                />
              </div>

              {canChangeRole() && editingUser?.id !== user?.id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="USER">User</option>
                    <option value="VOLUNTEER">Volunteer</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdate}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Update
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                  setForm({ name: "", email: "", city: "", skills: "", role: "USER" });
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-red-600">
              Confirm Delete
            </h3>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete user <strong>{userToDelete?.name}</strong>? 
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
    </>
  );
}