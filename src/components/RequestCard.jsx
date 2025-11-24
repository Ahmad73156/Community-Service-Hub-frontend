import { motion } from "framer-motion";

export default function RequestCard({ request, onVolunteer, isAdmin }) {
  return (
    <motion.div
      className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-xl font-bold">{request.title}</h3>
      <p className="text-gray-600">{request.description}</p>
      <p className="text-sm text-gray-400">Category: {request.category}</p>
      <p className="text-sm text-gray-400">Created by: {request.creator?.name}</p>
      {!isAdmin && (
        <button
          onClick={() => onVolunteer(request.id)}
          className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Volunteer
        </button>
      )}
    </motion.div>
  );
}
