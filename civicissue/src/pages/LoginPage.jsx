// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";
import { login } from "../utils/api"; // Import the login API function

export default function LoginPage({ onLogin }) {
  const [role, setRole] = useState("User");
  const [language, setLanguage] = useState("English");
  const [form, setForm] = useState({
    identifier: "",
    password: "",
    securityCode: "",
    govId: "",
    adminPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Clear any existing auth data when component mounts
  useEffect(() => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }, []);

  function handleRoleChange(e) {
    const newRole = e.target.value;
    setRole(newRole);
    setForm({
      identifier: "",
      password: "",
      securityCode: "",
      govId: "",
      adminPassword: "",
    });
    setErrors({});
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  // validate returns an errors object
  function validate() {
    const err = {};
    if (role === "User") {
      if (!form.identifier.trim()) err.identifier = "Required";
      if (!form.password.trim()) err.password = "Required";
    } else {
      if (!form.govId.trim()) err.govId = "Government ID required";
      if (!form.adminPassword.trim()) err.adminPassword = "Password required";
    }
    return err;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // run validation
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    setErrors({});

    try {
      if (role === "User") {
        // Make real API call for user login
        const response = await login(form.identifier, form.password);
        
        // Store token and role in localStorage
        localStorage.setItem("token", response.token);
        localStorage.setItem("role", "user");
        localStorage.setItem("username", response.username || form.identifier);

        // Inform App (if handler provided)
        if (typeof onLogin === "function") onLogin(response.token, "user");

        // Navigate to dashboard
        navigate("/dashboard");
      } else {
        // For admin, we'll use the same login endpoint but check the role
        const response = await login(form.govId, form.adminPassword);
        
        // Check if the user is actually an admin
        if (response.role === "admin") {
          localStorage.setItem("token", response.token);
          localStorage.setItem("role", "admin");
          localStorage.setItem("username", response.username || form.govId);

          if (typeof onLogin === "function") onLogin(response.token, "admin");

          navigate("/admin");
        } else {
          setErrors({ govId: "Invalid admin credentials" });
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.status === 401) {
        setErrors({ 
          identifier: "Invalid credentials", 
          password: "Invalid credentials",
          govId: "Invalid credentials",
          adminPassword: "Invalid credentials"
        });
      } else {
        setErrors({ general: "Login failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page-root">
      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <h2 className="login-title">Login</h2>

        {errors.general && <div className="error">{errors.general}</div>}

        <label className="label">Role</label>
        <select className="select" value={role} onChange={handleRoleChange}>
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>

        <label className="label">Select preferred Language:</label>
        <select
          className="select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>English</option>
          <option>Hindi</option>
          <option>Gujarati</option>
          <option>Dogri</option>
        </select>

        {role === "User" && (
          <>
            <label className="label">Mobile No / Email Id / Username</label>
            <input
              className={`input ${errors.identifier ? "input-error" : ""}`}
              name="identifier"
              value={form.identifier}
              onChange={handleChange}
              placeholder="Mobile No / Email Id / Username"
              disabled={loading}
            />
            {errors.identifier && <div className="error">{errors.identifier}</div>}

            <label className="label">Password</label>
            <input
              type="password"
              className={`input ${errors.password ? "input-error" : ""}`}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              disabled={loading}
            />
            {errors.password && <div className="error">{errors.password}</div>}

            <label className="label">Security code</label>
            <input
              className={`input ${errors.securityCode ? "input-error" : ""}`}
              name="securityCode"
              value={form.securityCode}
              onChange={handleChange}
              placeholder="Security code (optional)"
              disabled={loading}
            />
            {errors.securityCode && <div className="error">{errors.securityCode}</div>}
          </>
        )}

        {role === "Admin" && (
          <>
            <label className="label">Allocated Government / Admin ID</label>
            <input
              className={`input ${errors.govId ? "input-error" : ""}`}
              name="govId"
              value={form.govId}
              onChange={handleChange}
              placeholder="e.g. GOV-123456 or Admin ID"
              disabled={loading}
            />
            {errors.govId && <div className="error">{errors.govId}</div>}

            <label className="label">Admin Password</label>
            <input
              type="password"
              className={`input ${errors.adminPassword ? "input-error" : ""}`}
              name="adminPassword"
              value={form.adminPassword}
              onChange={handleChange}
              placeholder="Admin password"
              disabled={loading}
            />
            {errors.adminPassword && <div className="error">{errors.adminPassword}</div>}

            <div className="note">
              Admins must use their official allocated ID. Contact system admin to reset credentials.
            </div>
          </>
        )}

        <button type="submit" className="btn-login" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="register-line">
          Don't have an account? <Link className="link" to="/register">Register</Link>
        </div>
      </form>
    </div>
  );
}