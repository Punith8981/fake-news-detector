import { motion } from "framer-motion";

function ResultCard({ result }) {
  if (!result) return null;

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Prediction Result</h2>

      <div
        style={{
          background: result.label === "REAL" ? "#16a34a" : "#dc2626",
          color: "white",
          padding: "15px",
          borderRadius: "12px",
          fontSize: "32px",
          fontWeight: "bold",
          margin: "20px auto",
          width: "220px",
          textAlign: "center",
        }}
      >
        {result.label}
      </div>

      <p>
        <strong>Confidence:</strong> {result.confidence}%
      </p>

      <progress value={result.confidence} max="100"></progress>

      <p style={{ marginTop: "15px" }}>
        {result.message}
      </p>
    </motion.div>
  );
}

export default ResultCard;