// src/pages/Register.jsx
import React, { useState } from "react";
import "../styles/Register.css";
import { useNavigate, Link } from "react-router-dom";

export default function Register({ onRegister }) {
  const navigate = useNavigate();
  const [role, setRole] = useState("User");
  const [lang, setLang] = useState("English");

  // Clear any existing auth data when component mounts
  React.useEffect(() => {
    // Clear any existing auth data to ensure fresh registration
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }, []);

  // Common fields
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState(""); // email/mobile/username or admin email
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [securityCode, setSecurityCode] = useState("");

  // Admin-only fields
  const [govId, setGovId] = useState("");
  const [department, setDepartment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(""); // For success/error messages

  function validate() {
    const err = {};
    if (!fullName.trim()) err.fullName = "Full name is required";
    if (!identifier.trim()) err.identifier = role === "User" ? "Mobile / Email / Username is required" : "Admin email is required";
    else if (role === "Admin" && !/^\S+@\S+\.\S+$/.test(identifier)) err.identifier = "Enter a valid admin email";
    if (!password) err.password = "Password is required";
    if (password && password.length < 6) err.password = "Password must be at least 6 characters";
    if (confirm !== password) err.confirm = "Passwords do not match";
    if (role === "Admin" && !govId.trim()) err.govId = "Government ID is required for admins";
    return err;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    setSubmitting(true);
    setMessage(""); // Clear any previous messages

    try {
      // Import the API function
      const { register } = await import("../utils/api");
      
      // For simplicity, we'll use the identifier as the username
      const username = identifier;

      // Call the actual API - include `name` per backend requirement
      const response = await register(fullName, username, password, role.toLowerCase());
      
      // Registration successful
      setMessage("Registration successful! Redirecting...");
      
      // Store user data
      localStorage.setItem("username", fullName || username);
      
      // Call the onRegister callback if provided
      if (onRegister) {
        onRegister(response.token, response.user.role);
      }
      
      // Redirect based on role
      setTimeout(() => {
        if (role === "Admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }, 1500);
      
    } catch (error) {
      console.error("Registration error:", error);
      setMessage(error.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="register-root">
      <form className="register-card" onSubmit={handleSubmit}>
        <h2 className="register-title">Create an account</h2>

        {message && (
          <div className={`field-error ${message.includes('successful') ? 'success' : ''}`} style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {message}
          </div>
        )}

        <label className="field-label">Role</label>
        <select className="field-select" value={role} onChange={(e) => setRole(e.target.value)}>
          <option>User</option>
          <option>Admin</option>
        </select>

        <label className="field-label">Select preferred Language</label>
        <select className="field-select" value={lang} onChange={(e) => setLang(e.target.value)}>
          <option>English</option>
          <option>Hindi</option>
          <option>Spanish</option>
          <option>Dogri</option>
        </select>

        <label className="field-label">Full name</label>
        <input
          className={`field-input ${errors.fullName ? "has-error" : ""}`}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
        />
        {errors.fullName && <div className="field-error">{errors.fullName}</div>}

        {role === "User" ? (
          <>
            <label className="field-label">Mobile No / Email / Username</label>
            <input
              className={`field-input ${errors.identifier ? "has-error" : ""}`}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Mobile No / Email Id / Username"
            />
            {errors.identifier && <div className="field-error">{errors.identifier}</div>}
          </>
        ) : (
          <>
            <label className="field-label">Admin Email</label>
            <input
              className={`field-input ${errors.identifier ? "has-error" : ""}`}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Admin Email"
            />
            {errors.identifier && <div className="field-error">{errors.identifier}</div>}

            <label className="field-label">Government ID</label>
            <input
              className={`field-input ${errors.govId ? "has-error" : ""}`}
              value={govId}
              onChange={(e) => setGovId(e.target.value)}
              placeholder="Government ID"
            />
            {errors.govId && <div className="field-error">{errors.govId}</div>}

            <label className="field-label">Department</label>
            <input
              className={`field-input ${errors.department ? "has-error" : ""}`}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Department"
            />
            {errors.department && <div className="field-error">{errors.department}</div>}

            <label className="field-label">Security Code</label>
            <input
              className={`field-input ${errors.securityCode ? "has-error" : ""}`}
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              placeholder="Security Code"
            />
            {errors.securityCode && <div className="field-error">{errors.securityCode}</div>}
          </>
        )}

        <label className="field-label">Password</label>
        <input
          className={`field-input ${errors.password ? "has-error" : ""}`}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        {errors.password && <div className="field-error">{errors.password}</div>}

        <label className="field-label">Confirm Password</label>
        <input
          className={`field-input ${errors.confirm ? "has-error" : ""}`}
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm Password"
        />
        {errors.confirm && <div className="field-error">{errors.confirm}</div>}

        <button className="field-button" type="submit" disabled={submitting}>
          {submitting ? "Registering..." : "Register"}
        </button>

        <div className="field-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
}
