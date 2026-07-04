import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const [stats, setStats] = useState({
    total_checks: 0,
    real: 0,
    fake: 0,
  });

  useEffect(() => {
    fetch("http://127.0.0.1:8000/dashboard-stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => console.log("Dashboard API not available"));
  }, []);

  const data = {
    labels: ["Real News", "Fake News"],
    datasets: [
      {
        data: [stats.real || 0, stats.fake || 0],
        backgroundColor: ["#22c55e", "#ef4444"],
      },
    ],
  };

  return (
    <div className="card">
      <h2>📊 Dashboard</h2>

      <p><strong>Total Checks:</strong> {stats.total_checks}</p>

      <div
        style={{
          width: "300px",
          margin: "30px auto",
        }}
      >
        <Pie data={data} />
      </div>
    </div>
  );
}

export default Dashboard;