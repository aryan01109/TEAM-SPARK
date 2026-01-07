// src/components/AdminHeader.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "./Logo";
import "../styles/AdminHeader.css"; // optional - create or reuse AdminDashboard.css

/**
 * AdminHeader
 * Props:
 *  - active: string ("dashboard" | "manage" | "departments" | "analytics" | "reports")
 *  - onToggleSidebar: optional function to toggle sidebar visibility
 *  - onLogout: function to handle logout
 */
export default function AdminHeader({ active = "dashboard", onToggleSidebar = null, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      if (onLogout) {
        onLogout();
      } else {
        // Fallback logout - clear localStorage and redirect
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('username');
        } catch (error) {
          console.error('Error clearing auth data:', error);
        }
        navigate("/login");
      }
    }
  };

  const navItem = (key, label, to) => {
    const isActive = active === key;
    return (
      <button
        className={`ah-nav-item ${isActive ? "active" : ""}`}
        onClick={() => navigate(to)}
        type="button"
        aria-current={isActive ? "page" : undefined}
        style={{
          background: "transparent",
          border: "none",
          padding: "8px 12px",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: isActive ? 700 : 500,
          color: isActive ? "#0f172a" : "#4b5563"
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <header className="admin-header" style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 18px",
      background: "#fff",
      borderBottom: "1px solid rgba(15,23,42,0.04)",
      gap: 12
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* optional sidebar toggle */}
        <button
          onClick={() => onToggleSidebar && onToggleSidebar()}
          aria-label="Toggle sidebar"
          className="ah-hamburger"
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 18,
            padding: 6
          }}
        >
          ☰
        </button>

        {/* Logo / title */}
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            
      <div className="civic-left">
        <div className="brand-wrap">
          <div className="brand-icon" aria-hidden>
            <Logo size="lg" />
          </div>

          <div className="brand-text">
            <div className="brand-title">CivicConnect Admin</div>
            <div className="brand-sub">Manage • Monitor • Analyze</div>
          </div>
        </div>
      </div>

        </div>
      </div>

      {/* main nav */}
      <nav style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {navItem("dashboard", "Dashboard", "/admin")}
        {navItem("manage", "Manage Issues", "/admin/manage-issues")}
        {navItem("departments", "Departments", "/admin/departments")}
        {navItem("map", "Map", "/admin/map")}
        
        <Link to="/feedback" className="nav-link" style={{ textDecoration: 'none', color: '#4b5563', padding: '8px 12px', borderRadius: 8, fontWeight: 500 }}>
          Feedback
        </Link>
      </nav>

      {/* right-hand utilities */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          className="ah-btn"
          onClick={() => navigate("/admin/settings")}
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid rgba(15,23,42,0.06)",
            background: "transparent",
            cursor: "pointer"
          }}
        >
          Settings
        </button>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            background: "#ef4444",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#dc2626";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#ef4444";
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
