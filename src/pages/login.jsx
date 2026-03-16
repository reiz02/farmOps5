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

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>

      <p style={{ marginTop: "15px" }}>
        <Link to="/register">Register</Link>
      </p>

      {dialog.show && (
        <div className="dialog-overlay">
          <div className={`dialog-box ${dialog.type}`}>
            <h3>{dialog.type === "error" ? "Error" : "Success"}</h3>
            <p>{dialog.message}</p>

            {dialog.type === "error" && (
              <button onClick={closeDialog}>Close</button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default Login;