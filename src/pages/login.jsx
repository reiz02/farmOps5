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
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");
        setDialog({ show: true, message: "Login successful!", type: "success" });

        setTimeout(() => {
          navigate("/dashboard");
        }, 1200);
      } else {
        setDialog({ show: true, message: data.error || "Login failed", type: "error" });
      }
    } catch (err) {
      console.error("Login error:", err);
      setDialog({ show: true, message: "Server connection error.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Login</h2>
    

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div style={{ textAlign: "right", marginBottom: "15px" }}>
          <Link 
            to="/forgot-password" 
            style={{ fontSize: "13px", color: "#3b82f6", textDecoration: "none" }}
          >
            Forgot Password?
          </Link>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ marginTop: "20px", fontSize: "14px", color: "#9ca3af" }}>
        Don't have an account?{" "}
        <Link to="/register" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "600" }}>
          Register
        </Link>
      </p>

      {/* Dialog Box */}
      {dialog.show && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3 className={dialog.type}>{dialog.type === "error" ? "Error" : "Success"}</h3>
            <p>{dialog.message}</p>
            <button onClick={closeDialog}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;