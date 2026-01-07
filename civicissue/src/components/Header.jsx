// src/components/Header.jsx
import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/UserDashboard.css";
import "../styles/Header.css";

export default function Header({ unread = 3 }) {
  const [open, setOpen] = useState(false); // profile dropdown
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // close dropdown when clicking outside
  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function handleLogout() {
    // clear any stored auth / role (demo)
    localStorage.removeItem("appRole");
    // navigate to login
    navigate("/login");
  }

  return (
    <header className="cc-topbar" role="banner">
      <div className="cc-topbar-inner">
        <div className="cc-left">
          <div className="cc-logo" aria-hidden>▦</div>

          <div className="brand">
            <div className="brand-title">SmartCivic</div>
            <div className="brand-tagline">Turning citizen voices into government action</div>
          </div>
        </div>

        <nav className="cc-nav" aria-label="Primary">
          <NavLink to="/user" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Home
          </NavLink>

         
         <NavLink to="/user/reportissue" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
          Report Issue
          </NavLink>


          <NavLink to="/user/myreports" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            My Reports
          </NavLink>

          <NavLink to="/user/community" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Community
          </NavLink>

          <NavLink to="/features" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Features
          </NavLink>
        </nav>

        <div className="cc-right">
          <div className="cc-search" role="search" aria-label="Site search">
            <input className="cc-search-input" placeholder="Search" aria-label="Search" />
          </div>

          {/* Notification button */}
          <div className="cc-notif" ref={notifRef}>
            <button
              className="cc-icon-btn"
              aria-label="Notifications"
              onClick={() => setNotifOpen((v) => !v)}
              title="Notifications"
            >
              {/* Bell SVG */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M15 17H9" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 22c1.1 0 2-.9 2-2H10c0 1.1.9 2 2 2z" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M18 15v-5c0-3.1-2.2-5.6-5-6.2V3a1 1 0 10-2 0v.8C8.2 4.4 6 6.9 6 10v5l-1.8 1.8A1 1 0 005 19h14a1 1 0 00.8-1.6L18 15z" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>

              {/* badge */}
              {unread > 0 && <span className="cc-badge" aria-hidden>{unread}</span>}
            </button>

            {notifOpen && (
              <div className="cc-notif-panel" role="dialog" aria-label="Notifications panel">
                <div className="cc-notif-item">
                  <strong>3 new updates</strong>
                  <div className="cc-notif-sub">New comment on your report</div>
                </div>
                <div className="cc-notif-item">
                  <strong>1 issue closed</strong>
                  <div className="cc-notif-sub">Graffiti on Main Street</div>
                </div>
                <div className="cc-notif-footer">
                  <button className="cc-notif-link">View all</button>
                </div>
              </div>
            )}
          </div>

          {/* Profile avatar + dropdown */}
          <div className="cc-profile" ref={menuRef}>
            <button
              className="cc-avatar"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={open}
              aria-label="Open profile menu"
            >
              S
            </button>

            {open && (
              <div className="cc-profile-menu" role="menu" aria-label="Profile menu">
                <button className="cc-profile-item" onClick={() => { setOpen(false); navigate("/profile"); }}>
                  Profile
                </button>
                <button className="cc-profile-item" onClick={() => { setOpen(false); navigate("/settings"); }}>
                  Settings
                </button>
                <div className="cc-profile-divider" />
                <button className="cc-profile-item danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
