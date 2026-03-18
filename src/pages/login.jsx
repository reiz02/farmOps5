import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./register.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ show: false, message: "", type: "error" });

  const navigate = useNavigate();

  const closeDialog = () => {
    setDialog({ show: false, message: "", type: "error" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Client-side validation
    if (!email.trim() || !password) {
      setDialog({ show: true, message: "Please fill all required fields.", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // 2. Successful Login: Store user data and redirect
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");
        setDialog({ show: true, message: "Login successful!", type: "success" });

        setTimeout(() => {
          navigate("/dashboard");
        }, 1200);
      } else {
        // 3. Backend Error handling
        setDialog({ show: true, message: data.error || "Login failed", type: "error" });
      }
    } catch (err) {
      console.error("Login error:", err);
      setDialog({ show: true, message: "Server connection error.", type: "error" });
    }

    setLoading(false);
  };

  return (
    <div className="register-container">
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* FORGOT PASSWORD LINK - Redirects to the route in App.js */}
        <div style={{ textAlign: "right", marginBottom: "15px" }}>
          <Link 
            to="/forgot-password" 
            style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none" }}
          >
            Forgot Password?
          </Link>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ marginTop: "15px", textAlign: "center" }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>

      {/* Reusable Dialog Box for Success/Error */}
      {dialog.show && (
        <div className="dialog-overlay">
          <div className={`dialog-box ${dialog.type}`}>
            <h3>{dialog.type === "error" ? "Error" : "Success"}</h3>
            <p>{dialog.message}</p>
            <button onClick={closeDialog}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;