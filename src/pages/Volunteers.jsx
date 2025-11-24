import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance.js";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar.jsx";

export default function Volunteers() {
  const { user, logout, isAuthenticated } = useAuth();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [volunteerToUpdate, setVolunteerToUpdate] = useState(null);
  const [volunteerToDelete, setVolunteerToDelete] = useState(null);
  const [form, setForm] = useState({
    status: "interested"
  });

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      console.log("❌ User not authenticated, redirecting...");
      return;
    }
    
    console.log("🔍 Current User:", user);
    const token = localStorage.getItem("token");
    console.log("🔍 Token exists:", !!token);
  }, [user, isAuthenticated]);

  // Fetch all volunteers via requests endpoint
  const fetchVolunteers = async () => {
    if (!user || !isAuthenticated()) {
      console.log("❌ No user found or not authenticated");
      return;
    }
    
    try {
      setLoading(true);
      console.log("🔄 Fetching volunteers for user:", user.role, user.id);
      
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login again");
        return;
      }

      console.log("📡 Fetching from requests endpoint...");
      const res = await axiosInstance.get("/requests", {
        params: { userId: user.id },
      });

      console.log("✅ Requests fetched successfully:", res.data);
      setRequests(res.data);
      
      // Collect volunteers from each request with request context
      const allVolunteers = [];
      res.data.forEach((req) => {
        if (req.volunteers && req.volunteers.length > 0) {
          req.volunteers.forEach(vol => {
            allVolunteers.push({
              ...vol,
              requestTitle: req.title,
              requestId: req.id,
              requestCategory: req.category,
              requestCreatorId: req.creator?.id,
              requestCreator: req.creator,
              request: req
            });
          });
        }
      });

      console.log("✅ Volunteers processed:", allVolunteers.length, "volunteers");
      setVolunteers(allVolunteers);
      
    } catch (err) {
      console.error("❌ Error fetching volunteers:", err);
      console.error("❌ Error details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else if (err.response?.status === 403) {
        toast.error("Access denied. You don't have permission to view this page.");
      } else {
        toast.error(err.response?.data || "Failed to load volunteers");
      }
    } finally {
      setLoading(false);
    }
  };

  
  // FIXED: Handle update volunteer status using axiosInstance
  const handleUpdateStatus = async () => {
    if (!volunteerToUpdate) return;

    try {
      console.log("🔄 Updating volunteer status:", {
        volunteerId: volunteerToUpdate.id,
        newStatus: form.status
      });

      // Use axiosInstance instead of fetch for consistent API calls
      const response = await axiosInstance.put(`/volunteer/${volunteerToUpdate.id}/status?status=${form.status}`);

      console.log("✅ Volunteer status updated successfully:", response.data);
      toast.success("Volunteer status updated successfully!");
      
      setShowStatusModal(false);
      setVolunteerToUpdate(null);
      setForm({ status: "interested" });
      
      // Refresh the data immediately
      fetchVolunteers();
      
    } catch (err) {
      console.error("❌ Error updating volunteer status:", err);
      
      const errorDetails = {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      };
      
      console.error("❌ Full error details:", errorDetails);
      
      if (err.response?.status === 401) {
        toast.error("Authentication failed. The server cannot identify the current user.");
      } else if (err.response?.status === 403) {
        toast.error("Access denied. You don't have permission to update this volunteer.");
      } else if (err.response?.status === 400) {
        toast.error(err.response?.data || "Bad request - check volunteer ID and status");
      } else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        toast.error("Network error - check backend server");
      } else {
        toast.error(err.response?.data || "Failed to update volunteer status");
      }
    }
  };

  // Handle remove volunteer
  const handleRemoveVolunteer = async (volunteer) => {
    setVolunteerToDelete(volunteer);
    setShowDeleteModal(true);
  };

  // Confirm remove volunteer
  const confirmRemoveVolunteer = async () => {
    if (!volunteerToDelete) return;

    try {
      console.log("🗑️ Removing volunteer:", volunteerToDelete.id);
      
      console.log("🔐 Remove Debug:", {
        userRole: user?.role,
        isAdmin: user?.role === "ADMIN",
        isRequestCreator: volunteerToDelete.requestCreatorId === user?.id,
        canManage: canManageVolunteers(volunteerToDelete)
      });

      await axiosInstance.delete(`/volunteer/${volunteerToDelete.id}`);
      
      toast.success(`Volunteer ${volunteerToDelete.volunteer?.name} removed successfully!`);
      setShowDeleteModal(false);
      setVolunteerToDelete(null);
      fetchVolunteers();
    } catch (err) {
      console.error("❌ Error removing volunteer:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else if (err.response?.status === 403) {
        toast.error("Access denied. You don't have permission to remove this volunteer.");
      } else {
        toast.error(err.response?.data || "Failed to remove volunteer");
      }
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700';
      case 'interested':
      default:
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      case 'completed':
        return '🎉';
      case 'interested':
      default:
        return '⏳';
    }
  };

  // Check if current user can manage volunteers (ADMIN or request creator)
  const canManageVolunteers = (volunteer) => {
    if (!user) return false;
    
    if (user.role === "ADMIN") return true;
    
    return volunteer.requestCreatorId === user.id;
  };

  // Get management permission text
  const getManagementPermission = (volunteer) => {
    if (user?.role === "ADMIN") {
      return "ADMIN - Can manage all volunteers";
    } else if (volunteer.requestCreatorId === user?.id) {
      return "Request Creator - Can manage your volunteers";
    } else {
      return "No management permissions";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Test API connectivity
  const testAPIConnectivity = async () => {
    try {
      console.log("🧪 Testing API connectivity...");
      const response = await axiosInstance.get("/requests", {
        params: { userId: user.id },
      });
      console.log("✅ API connectivity test passed - Requests:", response.data.length);
      return true;
    } catch (err) {
      console.log("❌ API connectivity test failed:", err.response?.status);
      return false;
    }
  };

  // Comprehensive API testing function
  const testAllAPIs = async () => {
    console.group("🧪 Comprehensive API Testing");
    
    const apiTest = await testAPIConnectivity();
    
    console.log("📊 Test Results:", {
      "API Connectivity": apiTest ? "✅" : "❌"
    });
    
    console.groupEnd();
    
    if (apiTest) {
      // toast.success("API connectivity test passed!");
    } else {
      //toast.error("API connectivity test failed.");
    }
  };

  // Check token validity
  const checkTokenValidity = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("❌ No token found");
      return false;
    }
    
    try {
      const isValid = token.length > 50;
      console.log("🔐 Token validity check:", isValid ? "✅ Valid" : "❌ Invalid");
      return isValid;
    } catch (error) {
      console.log("❌ Token validation error:", error);
      return false;
    }
  };

  useEffect(() => {
    if (user && isAuthenticated()) {
      if (!checkTokenValidity()) {
        toast.error("Please login again");
        return;
      }
      
      fetchVolunteers();
      setTimeout(() => {
        testAllAPIs();
      }, 1000);
    }
  }, [user, isAuthenticated]);

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-11">
          {/* Page Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Volunteer Management
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Manage volunteers across all community requests. Approve, reject, or track volunteer progress.
            </p>
            
            {/* Enhanced Debug Info */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>User:</strong> {user?.name} | <strong>ID:</strong> {user?.id}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Role:</strong> <span className={`font-bold ${user?.role === 'ADMIN' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'}`}>
                  {user?.role}
                </span>
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Your Requests:</strong> {requests.filter(req => req.creator?.id === user?.id).length}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Manageable Volunteers:</strong> {volunteers.filter(vol => canManageVolunteers(vol)).length}
              </p>
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={testAllAPIs}
                  className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  Test API
                </button>
                <button
                  onClick={fetchVolunteers}
                  className="flex-1 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                >
                  Refresh Data
                </button>
                <button
                  onClick={checkTokenValidity}
                  className="flex-1 px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                >
                  Check Token
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats Summary */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {volunteers.length}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Volunteers</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                {volunteers.filter(v => v.status === 'interested').length}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Interested</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {volunteers.filter(v => v.status === 'approved').length}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Approved</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                {volunteers.filter(v => v.status === 'rejected').length}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Rejected</div>
            </div>
          </motion.div>

          {/* Role-based Access Info */}
          {user?.role === "ADMIN" && (
            <motion.div
              className="mb-6 p-4 bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center">
                <span className="text-purple-600 dark:text-purple-400 text-lg mr-2">👑</span>
                <div>
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200">Administrator Access</h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    You have full permissions to manage all volunteers across all requests.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Volunteers Grid */}
          {volunteers.length === 0 ? (
            <motion.div
              className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">👥</div>
              <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-4">
                No Volunteers Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-6 max-w-md mx-auto">
                Volunteers will appear here when users start volunteering for community requests.
              </p>
              <div className="text-sm text-gray-400 dark:text-gray-500">
                <p>Volunteers can join requests by clicking the "Volunteer" button on any request.</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {volunteers.map((vol) => (
                <motion.div
                  key={vol.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Volunteer Header */}
                  <div className="p-6 border-b border-gray-100 dark:border-gray-600">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">
                          {vol.volunteer?.name || 'Unknown Volunteer'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {vol.volunteer?.email || 'No email provided'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(vol.status)}`}>
                          {getStatusIcon(vol.status)} {vol.status?.toUpperCase() || 'INTERESTED'}
                        </span>
                      </div>
                    </div>

                    {/* Volunteer Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <span className="font-medium mr-2">Role:</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          vol.volunteer?.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          vol.volunteer?.role === 'VOLUNTEER' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {vol.volunteer?.role || 'USER'}
                        </span>
                      </div>
                      
                      {vol.volunteer?.city && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="mr-2">📍</span>
                          <span>{vol.volunteer.city}</span>
                        </div>
                      )}
                      
                      {vol.volunteer?.skills && (
                        <div className="flex items-start text-gray-600 dark:text-gray-400">
                          <span className="mr-2 mt-1">🛠️</span>
                          <span className="flex-1">{vol.volunteer.skills}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                        <span className="mr-2">📅</span>
                        <span>Joined: {formatDate(vol.respondedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Request Info */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                      <span className="mr-2">📋</span>
                      Request Details
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700 dark:text-gray-300 font-medium">
                        {vol.request?.title || vol.requestTitle}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Category: {vol.request?.category || vol.requestCategory}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Request by: {vol.requestCreator?.name || 'Unknown'}
                        {vol.requestCreatorId === user?.id && (
                          <span className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded text-xs">
                            Your Request
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4">
                    <div className="flex flex-col space-y-2">
                      {canManageVolunteers(vol) ? (
                        <>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setVolunteerToUpdate(vol);
                                setForm({ status: vol.status || "interested" });
                                setShowStatusModal(true);
                              }}
                              className="flex-1 px-4  py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm flex items-center justify-center"
                            >
                              <span className="mr-2">✏️</span>
                              Update Status
                            </button>
                            
                            <button
                              onClick={() => handleRemoveVolunteer(vol)}
                              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm flex items-center justify-center"
                            >
                              <span className="mr-2">🗑️</span>
                              Remove
                            </button>
                          </div>
                          
                          <div className="text-center">
                            <span className={`text-xs font-medium ${
                              user?.role === "ADMIN" 
                                ? "text-purple-600 dark:text-purple-400" 
                                : "text-green-600 dark:text-green-400"
                            }`}>
                              {user?.role === "ADMIN" 
                                ? "👑 ADMIN - Full management access" 
                                : "✅ You can manage this volunteer"}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center space-y-2">
                          <button
                            onClick={() => {
                              setVolunteerToUpdate(vol);
                              setForm({ status: vol.status || "interested" });
                              setShowStatusModal(true);
                            }}
                            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium text-sm flex items-center justify-center"
                          >
                            <span className="mr-2">👁️</span>
                            View Details
                          </button>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user?.role === "ADMIN" 
                              ? "Unexpected: ADMIN should have access to all volunteers" 
                              : "Only request creators and admins can manage volunteers"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Update Status Modal */}
          {showStatusModal && volunteerToUpdate && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl  shadow-2xl w-full max-w-md"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Modal Header */}
                <div className="p-6  border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <span className="mr-3">🎯</span>
                    Update Volunteer Status
                  </h3>
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Permission:</strong> {getManagementPermission(volunteerToUpdate)}
                    </p>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Volunteer Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-[-10px]">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 ">
                        Volunteer Information
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>Name:</strong> {volunteerToUpdate.volunteer?.name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        <strong>Email:</strong> {volunteerToUpdate.volunteer?.email}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        <strong>Current Status:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(volunteerToUpdate.status)}`}>
                          {volunteerToUpdate.status?.toUpperCase()}
                        </span>
                      </p>
                    </div>

                    {/* Request Info */}
                    <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mt-[-10px]">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                        Request Information
                      </h4>
                      <p className="text-blue-700 dark:text-blue-300">
                        <strong>Title:</strong> {volunteerToUpdate.request?.title || volunteerToUpdate.requestTitle}
                      </p>
                      <p className="text-blue-600 dark:text-blue-400 text-sm">
                        <strong>Category:</strong> {volunteerToUpdate.request?.category || volunteerToUpdate.requestCategory}
                      </p>
                      <p className="text-blue-600 dark:text-blue-400 text-sm">
                        <strong>Created by:</strong> {volunteerToUpdate.requestCreator?.name}
                        {volunteerToUpdate.requestCreatorId === user?.id && (
                          <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            You
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Status Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 mt-[-16px]">
                        Select New Status
                      </label>
                      <select
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                      >
                        <option value="interested">⏳ Interested</option>
                        <option value="approved">✅ Approved</option>
                        <option value="rejected">❌ Rejected</option>
                        <option value="completed">🎉 Completed</option>
                      </select>
                    </div>

                    {/* Status Description */}
                    {form.status === 'approved' && (
                      <div className="p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-300">
                          ✅ <strong>Approved:</strong> Volunteer will be notified and can start helping with the request immediately.
                        </p>
                      </div>
                    )}

                    {form.status === 'rejected' && (
                      <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          ❌ <strong>Rejected:</strong> Volunteer will be notified that they were not selected for this request.
                        </p>
                      </div>
                    )}

                    {form.status === 'completed' && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          🎉 <strong>Completed:</strong> Mark this volunteer's work as successfully completed.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="p-6 mt-[-40px] border-t border-gray-200 dark:border-gray-600 flex space-x-3">
                  <button
                    onClick={handleUpdateStatus}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold flex items-center justify-center"
                  >
                    <span className="mr-2">💾</span>
                    Update Status
                  </button>
                  <button
                    onClick={() => {
                      setShowStatusModal(false);
                      setVolunteerToUpdate(null);
                      setForm({ status: "interested" });
                    }}
                    className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-semibold flex items-center justify-center"
                  >
                    <span className="mr-2">✕</span>
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Custom Delete Confirmation Modal */}
          {showDeleteModal && volunteerToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-600 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🗑️</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    Remove Volunteer
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Are you sure you want to remove <strong>{volunteerToDelete.volunteer?.name}</strong> from this request?
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    This action cannot be undone.
                  </p>
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Permission:</strong> {getManagementPermission(volunteerToDelete)}
                    </p>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-600 flex space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-semibold flex items-center justify-center"
                  >
                    <span className="mr-2">✕</span>
                    Cancel
                  </button>
                  <button
                    onClick={confirmRemoveVolunteer}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold flex items-center justify-center"
                  >
                    <span className="mr-2">🗑️</span>
                    Remove Volunteer
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}