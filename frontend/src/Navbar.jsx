function Navbar({ onLogout }) {
  return (
    <nav className="navbar">
      <h2>📰 Fake News Detector</h2>

      <div className="menu">
        <a href="#">Home</a>
        <a href="#">Dashboard</a>
        <a href="#">About</a>

        <button
          onClick={onLogout}
          style={{
            marginLeft: "20px",
            background: "#dc2626",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;