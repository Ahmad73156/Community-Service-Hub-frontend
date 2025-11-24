import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance.js";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
export default function Requests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", category: "" });
  const [editId, setEditId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch all requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/requests", {
        params: { userId: user?.id }
      });
      console.log("Fetched requests:", res.data);
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  // Create or update request
  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error("Please log in to create requests");
      return;
    }

    try {
      if (editId) {
        await axiosInstance.put(`/requests/${editId}`, form, { 
          params: { userId: user.id } 
        });
        toast.success("Request updated successfully!");
      } else {
        await axiosInstance.post("/requests", { 
          ...form, 
          creatorId: user.id 
        });
        toast.success("Request created successfully!");
      }
      setForm({ title: "", description: "", category: "" });
      setEditId(null);
      setShowCreateModal(false);
      fetchRequests();
    } catch (err) {
      console.error("Error saving request:", err);
      toast.error(err.response?.data || "Failed to save request");
    }
  };

  // Delete request
  const handleDelete = async (id) => {
    if (!user?.id) {
      toast.error("User not found");
      return;
    }

    try {
      await axiosInstance.delete(`/requests/${id}`, { 
        params: { userId: user.id } 
      });
      toast.success("Request deleted successfully!");
      fetchRequests();
    } catch (err) {
      console.error("Error deleting request:", err);
      toast.error(err.response?.data || "Failed to delete request");
    }
  };

  // Volunteer for a request
  const handleVolunteer = async (requestId) => {
    if (!user?.id) {
      toast.error("Please log in to volunteer");
      return;
    }

    try {
      await axiosInstance.post(`/volunteer/${requestId}`, null, { 
        params: { userId: user.id } 
      });
      toast.success("Volunteered successfully!");
      fetchRequests();
    } catch (err) {
      console.error("Error volunteering:", err);
      toast.error(err.response?.data || "Failed to volunteer");
    }
  };

  // Start editing a request
  const handleEdit = (req) => {
    setForm({ 
      title: req.title, 
      description: req.description, 
      category: req.category 
    });
    setEditId(req.id);
    setShowCreateModal(true);
  };

  // Check if user can modify the request
  const canModifyRequest = (request) => {
    if (!user) return false;
    return user.role === "ADMIN" || request.creator?.id === user.id;
  };

  // Reset form and modal
  const resetForm = () => {
    setForm({ title: "", description: "", category: "" });
    setEditId(null);
    setShowCreateModal(false);
  };

  useEffect(() => { 
    if (user) {
      fetchRequests(); 
    }
  }, [user]);

  if (loading) return <Loader />;

  return (
    <>
    <Navbar/>
    <div className="p-8 max-w-7xl mx-auto ">
      {/* Page Header */}
      <motion.div
        className="flex justify-between items-center mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h2 className="text-3xl font-bold text-blue-600 mt-20">Community Requests</h2>
          <p className="text-gray-600 mt-2">
            Find opportunities to help or create your own request for assistance
          </p>
        </div>
        
        <motion.button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + Create Request
        </motion.button>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-white p-4 rounded-lg shadow-md border text-center">
          <div className="text-2xl font-bold text-blue-600">{requests.length}</div>
          <div className="text-sm text-gray-600">Total Requests</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border text-center">
          <div className="text-2xl font-bold text-green-600">
            {requests.filter(req => req.volunteers && req.volunteers.length > 0).length}
          </div>
          <div className="text-sm text-gray-600">Active Volunteers</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border text-center">
          <div className="text-2xl font-bold text-purple-600">
            {[...new Set(requests.map(req => req.category))].length}
          </div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border text-center">
          <div className="text-2xl font-bold text-orange-600">
            {requests.reduce((total, req) => total + (req.volunteers?.length || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Volunteers</div>
        </div>
      </motion.div>

      {/* Requests Grid */}
      {requests.length === 0 ? (
        <motion.div
          className="text-center py-16 bg-white rounded-xl shadow-md border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Requests Yet</h3>
          <p className="text-gray-500 mb-6">Be the first to create a community request!</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Request
          </button>
        </motion.div>
      ) : (
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {requests.map((req) => (
            <motion.div
              key={req.id}
              className="bg-white dark:bg-gray-800 shadow-md rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all overflow-hidden"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Request Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-xl text-indigo-600 flex-1 mr-2">
                    {req.title}
                  </h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {req.category}
                  </span>
                </div>
                
                <p className="text-gray-700 dark:text-gray-200 mb-4 line-clamp-3">
                  {req.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>By {req.creator?.name || 'Unknown'}</span>
                  <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Volunteers Section */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Volunteers ({req.volunteers?.length || 0})
                  </span>
                  {req.volunteers && req.volunteers.length > 0 && (
                    <span className="text-xs text-green-600 font-medium">
                      {req.volunteers.filter(v => v.status === 'approved').length} approved
                    </span>
                  )}
                </div>

                {/* Volunteer Avatars */}
                {req.volunteers && req.volunteers.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {req.volunteers.slice(0, 3).map((vol, index) => (
                      <div
                        key={vol.id}
                        className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        title={vol.volunteer?.name}
                      >
                        {vol.volunteer?.name?.charAt(0) || 'U'}
                      </div>
                    ))}
                    {req.volunteers.length > 3 && (
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
                        +{req.volunteers.length - 3}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No volunteers yet
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4">
                <div className="flex gap-2">
                  {canModifyRequest(req) && (
                    <>
                      <button
                        onClick={() => handleEdit(req)}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  
                  {user?.role !== "ADMIN" && !req.volunteers?.some(v => v.volunteer?.id === user?.id) && (
                    <button
                      onClick={() => handleVolunteer(req.id)}
                      className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      Volunteer
                    </button>
                  )}

                  {req.volunteers?.some(v => v.volunteer?.id === user?.id) && (
                    <button
                      className="flex-1 px-3 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed text-sm"
                      disabled
                    >
                      Volunteered
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create/Edit Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-purple-600">
              {editId ? "Edit Request" : "Create New Request"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  className="w-full p-3 border text-white border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                  placeholder="Enter request title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full p-3 border text-white border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent min-h-[100px]"
                  placeholder="Describe what help you need..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  className="w-full p-3 border text-white border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                  placeholder="e.g., Education, Food, Shelter"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={!form.title.trim()}
                className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {editId ? "Update Request" : "Create Request"}
              </button>
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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