import { motion } from "framer-motion";
import { FaNewspaper } from "react-icons/fa";

function Hero() {
  return (
    <motion.div
      className="hero"
      initial={{ opacity: 0, y: -80 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <FaNewspaper size={70} color="#38bdf8" />

      <h1>AI Fake News Detector</h1>

      <p>
        Detect Fake News using Artificial Intelligence,
        Machine Learning, YouTube Analysis and QR Verification.
      </p>
    </motion.div>
  );
}

export default Hero;