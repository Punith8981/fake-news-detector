import { useState } from "react";
import "./App.css";
import Signup from "./Signup";

function Login({ onLogin }) {
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (showSignup) {
    return <Signup onBack={() => setShowSignup(false)} />;
  }

  const login = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Login Successful");
        onLogin();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Unable to connect to server.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={login}>
        <h1>🔐 Login</h1>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>

        <p style={{ textAlign: "center", marginTop: "20px" }}>
          Don't have an account?
        </p>

        <button
          type="button"
          onClick={() => setShowSignup(true)}
          style={{ background: "#16a34a" }}
        >
          Create Account
        </button>
      </form>
    </div>
  );
}

export default Login;