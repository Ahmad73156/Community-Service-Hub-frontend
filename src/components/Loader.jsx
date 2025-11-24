import { motion } from "framer-motion";

export default function Loader() {
  return (
    <motion.div
      className="flex justify-center items-center h-64"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1 }}
    >
      <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full"></div>
    </motion.div>
  );
}
