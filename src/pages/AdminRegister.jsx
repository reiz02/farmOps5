import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./adminRegister.css";

function AdminRegister() {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ show: false, title: "", message: "" });
  const [verificationCode, setVerificationCode] = useState("");
  const [showCodePopup, setShowCodePopup] = useState(false);

  const navigate = useNavigate();

  const handleDialogClose = () => setDialog({ show: false, title: "", message: "" });

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      const response = await fetch("http://localhost:5000/api/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {

        setShowCodePopup(true);

        setDialog({
          show: true,
          title: "Verification",
          message: "A verification code was sent to your email."
        });

      } else {

        setDialog({
          show: true,
          title: "Error",
          message: data.error || "Failed to send verification code"
        });

      }

    } catch (err) {

      setDialog({
        show: true,
        title: "Error",
        message: "Server connection failed"
      });

    }

    setLoading(false);
  };

  const verifyAndRegisterAdmin = async () => {

    setLoading(true);

    try {

      const response = await fetch("http://localhost:5000/api/register-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          middleName,
          lastName,
          email,
          password,
          code: verificationCode
        }),
      });

      const data = await response.json();

      if (response.ok) {

        setDialog({
          show: true,
          title: "Success",
          message: data.message
        });

        setShowCodePopup(false);

        setTimeout(() => navigate("/"), 2500);

      } else {

        setDialog({
          show: true,
          title: "Error",
          message: data.error || "Admin registration failed"
        });

      }

    } catch (err) {

      setDialog({
        show: true,
        title: "Error",
        message: "Server error"
      });

    }

    setLoading(false);
  };

  return (
    <div className="admin-setup-container">
      <div className="admin-card">
        <h2>Admin Registration</h2>
        <p>Restricted Access</p>

        <form onSubmit={handleAdminSubmit}>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Middle Name (optional)"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
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

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register Admin"}
          </button>
        </form>
      </div>

      {dialog.show && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>{dialog.title}</h3>
            <p>{dialog.message}</p>
            <button
              onClick={() => {
                handleDialogClose();
                if (dialog.title === "Success") navigate("/");
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

    {showCodePopup && (
  <div
    className="dialog-overlay"
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.7)",
      zIndex: 1000,
    }}
  >
    <div
      className="dialog-box"
      style={{
        background: "#1f1f1f",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        maxWidth: "400px",
        width: "90%",
        textAlign: "center",
        color: "#f5f5f5",
      }}
    >
      <h3 style={{ marginBottom: "15px", color: "#fff" }}>Admin Verification</h3>
      <p style={{ marginBottom: "20px", color: "#ddd" }}>
        Enter the 6-digit code sent to your email.
      </p>

      <input
        type="text"
        placeholder="Enter code"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        maxLength={6}
        style={{
          width: "80%",
          padding: "10px",
          fontSize: "16px",
          textAlign: "center",
          border: "1px solid #555",
          borderRadius: "5px",
          backgroundColor: "#333",
          color: "#fff",
          marginBottom: "20px",
        }}
      />

      <button
        onClick={verifyAndRegisterAdmin}
        disabled={loading || verificationCode.length < 6}
        style={{
          width: "85%",
          padding: "10px",
          fontSize: "16px",
          backgroundColor: "#4CAF50",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: loading || verificationCode.length < 6 ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Verifying..." : "Verify & Register Admin"}
      </button>
    </div>
  </div>
)}
    </div>
  );
}

export default AdminRegister;