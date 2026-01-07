// src/pages/CommunityPage.jsx
import React from "react";
import Header from "../components/UserHeader";
import CommunitySection from "../components/CommunitySection";
import "../styles/UserDashboard.css";

export default function CommunityPage({ onLogout }) {
  return (
    <div className="page-wrap">
      <Header onLogout={onLogout} />
      <main className="dashboard-main">
        <div className="dashboard-heading">
          <h1 className="community-title">Community Hub</h1>
          <p className="community-sub">
            Connect with your neighbors and see what's happening in Ahmedabad. 
            Together, we're making our city better one report at a time.
          </p>
        </div>

        {/* Enhanced Community feed */}
        <CommunitySection />

        <footer className="footer" style={{ marginTop: '2rem', textAlign: 'center', padding: '1rem' }}>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            © 2024 CivicConnect Community. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
