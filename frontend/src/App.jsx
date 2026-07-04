import { useState } from "react";
import "./App.css";

import Navbar from "./Navbar";
import Hero from "./Hero";
import NewsForm from "./NewsForm";
import ResultCard from "./ResultCard";
import Dashboard from "./Dashboard";
import Login from "./Login";

function App() {
  const [news, setNews] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const [videoUrl, setVideoUrl] = useState("");
  const [videoResult, setVideoResult] = useState(null);

  const [articleTitle, setArticleTitle] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  const checkNews = async () => {
    if (!news.trim()) {
      alert("Please enter some news.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/check-news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: news,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Cannot connect to backend.");
    }

    setLoading(false);
  };

  const explainNews = async () => {
    if (!news.trim()) {
      alert("Please enter some news.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: news,
        }),
      });

      const data = await response.json();
      setExplanation(data.explanation);
    } catch (error) {
      alert("Unable to fetch explanation.");
    }
  };

  const checkVideo = async () => {
    if (!videoUrl.trim()) {
      alert("Please enter a YouTube URL.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/check-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: videoUrl,
        }),
      });

      const data = await response.json();
      setVideoResult(data);
    } catch (error) {
      alert("Unable to analyze video.");
    }
  };

  const reportNews = async () => {
    if (!news.trim()) {
      alert("Please enter some news.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: news,
        }),
      });

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert("Unable to submit report.");
    }
  };

  const generateQR = async () => {
    if (!articleTitle.trim()) {
      alert("Please enter an article title.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/register-article", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: articleTitle,
          publisher: "AI Fake News Detector",
        }),
      });

      const data = await response.json();
      setQrUrl(`http://127.0.0.1:8000/qr/${data.article_id}`);
    } catch (error) {
      alert("Unable to generate QR Code.");
    }
  };
if (!loggedIn) {
  return <Login onLogin={() => setLoggedIn(true)} />;
}
  return (
    <>
      <Navbar onLogout={() => setLoggedIn(false)} />
      <Dashboard />

      <div className="container">
        <Hero />

        <NewsForm
          news={news}
          setNews={setNews}
          checkNews={checkNews}
          loading={loading}
        />

        <button onClick={explainNews} style={{ marginTop: "15px", background: "#7c3aed" }}>
          🧠 Explain News
        </button>

        <button onClick={reportNews} style={{ marginTop: "15px", background: "#f59e0b" }}>
          🚩 Report Fake News
        </button>

        <ResultCard result={result} />

        {explanation && (
          <div className="card">
            <h2>AI Explanation</h2>
            <p>{explanation}</p>
          </div>
        )}

        <hr style={{ margin: "40px 0" }} />

        <h2>🎥 YouTube Fake News Detection</h2>

        <input
          type="text"
          placeholder="Paste YouTube Video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: "10px",
            marginTop: "15px",
            fontSize: "16px",
          }}
        />

        <button onClick={checkVideo} style={{ marginTop: "15px", background: "#dc2626" }}>
          🎥 Analyze Video
        </button>

        {videoResult && (
          <div className="card">
            <h2>Video Analysis</h2>
            <p><strong>Title:</strong> {videoResult.video_title}</p>
            <p><strong>Prediction:</strong> {videoResult.label}</p>
            <p><strong>Confidence:</strong> {videoResult.confidence}%</p>
            <p><strong>Transcript Available:</strong> {videoResult.has_transcript ? "Yes" : "No"}</p>
          </div>
        )}

        <hr style={{ margin: "40px 0" }} />

        <h2>📱 QR Code Verification</h2>

        <input
          type="text"
          placeholder="Enter Article Title"
          value={articleTitle}
          onChange={(e) => setArticleTitle(e.target.value)}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: "10px",
            marginTop: "15px",
            fontSize: "16px",
          }}
        />

        <button onClick={generateQR} style={{ marginTop: "15px", background: "#059669" }}>
          📱 Generate QR Code
        </button>

        {qrUrl && (
          <div className="card">
            <h2>Verification QR Code</h2>
            <img src={qrUrl} alt="QR Code" width="220" />
          </div>
        )}
      </div>
      
    </>
  );
}

export default App;