// import { useEffect, useState } from "react";
// import axiosInstance from "../api/axiosInstance.js";
// import RequestCard from "../components/RequestCard.jsx";
// import Loader from "../components/Loader.jsx";
// import { useAuth } from "../context/AuthContext.jsx";
// import { notifyError, notifySuccess } from "../utils/helpers.js";

// export default function Requests() {
//   const { user } = useAuth();
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchRequests = async () => {
//     try {
//       setLoading(true);
//       const res = await axiosInstance.get("/requests");
//       setRequests(res.data);
//     } catch (err) {
//       notifyError("Failed to load requests");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVolunteer = async (requestId) => {
//     try {
//       await axiosInstance.post(`/volunteer/${requestId}`);
//       notifySuccess("Volunteered successfully!");
//       fetchRequests();
//     } catch (err) {
//       notifyError(err.response?.data || "Failed to volunteer");
//     }
//   };

//   useEffect(() => {
//     fetchRequests();
//   }, []);

//   if (loading) return <Loader />;

//   return (
//     <div className="p-8 max-w-4xl mx-auto">
//       <h2 className="text-2xl font-bold mb-6">Requests</h2>
//       {requests.length === 0 ? (
//         <p>No requests found</p>
//       ) : (
//         requests.map((req) => (
//           <RequestCard
//             key={req.id}
//             request={req}
//             onVolunteer={handleVolunteer}
//             isAdmin={user?.role === "ADMIN"}
//           />
//         ))
//       )}
//     </div>
//   );
// }
