import Navbar from "../Navbar";
import Hero from "../Hero";
import Dashboard from "../Dashboard";
import NewsForm from "../NewsForm";
import ResultCard from "../ResultCard";

function Home() {
  return (
    <>
      <Navbar />
      <Dashboard />

      <div className="container">
        <Hero />

        <div className="card">
          <h2>📰 Fake News Detection</h2>
          <p>Analyze text news using the AI-powered fake news detector.</p>
        </div>

        <div className="card">
          <h2>🎥 YouTube Video Analysis</h2>
          <p>Analyze YouTube videos using title, description, and transcript.</p>
        </div>

        <div className="card">
          <h2>📱 QR Verification</h2>
          <p>Generate QR codes for verified articles.</p>
        </div>

        <div className="card">
          <h2>🚩 Report Fake News</h2>
          <p>Report suspicious news for fact-checking review.</p>
        </div>
      </div>
    </>
  );
}

export default Home;