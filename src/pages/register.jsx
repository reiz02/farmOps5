import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./register.css";

function Register() {

  const [firstName, setFname] = useState("");
  const [middleName, setMname] = useState("");
  const [lastName, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [section, setSection] = useState("Inventory");

  const [loading, setLoading] = useState(false);

  const [verificationCode, setVerificationCode] = useState("");
  const [showCodePopup, setShowCodePopup] = useState(false);

  const [dialog, setDialog] = useState({
    show: false,
    title: "",
    message: ""
  });

  const navigate = useNavigate();

  const closeDialog = () => {
    setDialog({ show: false, title: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password) {
      setDialog({
        show: true,
        title: "Error",
        message: "Please fill all required fields."
      });
      return;
    }

    setLoading(true);

    try {

      const response = await fetch("http://localhost:5000/api/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase()
        })
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

      console.error("Send code error:", err);

      setDialog({
        show: true,
        title: "Error",
        message: "Server error"
      });

    }

    setLoading(false);
  };

  const verifyAndRegister = async () => {

    setLoading(true);

    try {

      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          middleName: middleName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password,
          section,
          code: verificationCode
        })
      });

      const data = await response.json();

      if (response.ok) {

        setDialog({
          show: true,
          title: "Success",
          message: data.message
        });

        setShowCodePopup(false);

        setTimeout(() => {
          navigate("/");
        }, 2000);

      } else {

        setDialog({
          show: true,
          title: "Error",
          message: data.error || "Registration failed"
        });

      }

    } catch (err) {

      console.error("Register error:", err);

      setDialog({
        show: true,
        title: "Error",
        message: "Server error"
      });

    }

    setLoading(false);
  };

  return (
    <div className="register-container">

      <h2>Employee Registration</h2>
      <p>All new employees must wait for admin approval.</p>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFname(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Middle Name (optional)"
          value={middleName}
          onChange={(e) => setMname(e.target.value)}
        />

        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLname(e.target.value)}
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
          onChange={(e) => setPass(e.target.value)}
          required
        />

        <label>Section</label>

        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
        >
          <option value="Inventory">Inventory</option>
          <option value="Finance">Reports</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Create Employee Account"}
        </button>

      </form>

      <p>
        <Link to="/">Back to Login</Link>
      </p>

      {dialog.show && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>{dialog.title}</h3>
            <p>{dialog.message}</p>
            <button onClick={closeDialog}>OK</button>
          </div>
        </div>
      )}

      {showCodePopup && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Email Verification</h3>
            <p>Enter the verification code sent to your email.</p>

            <input
              type="text"
              placeholder="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />

            <button onClick={verifyAndRegister} disabled={loading}>
              Verify & Create Account
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Register;