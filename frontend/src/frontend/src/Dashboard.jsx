import { useEffect, useState } from "react";

function Dashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetch("http://127.0.0.1:8000/dashboard-stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="card">
      <h2>📊 Dashboard</h2>

      <p>
        <strong>Total Checks:</strong> {stats.total_checks}
      </p>

      <p>
        <strong>Real News:</strong> {stats.real}
      </p>

      <p>
        <strong>Fake News:</strong> {stats.fake}
      </p>
    </div>
  );
}

export default Dashboard;