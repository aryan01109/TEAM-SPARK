import React from "react";
import { useNavigate } from "react-router-dom";

import "../styles/features.css";

const FEATURES = [
  { id: 1, title: "One-Click Reporting", desc: "Simply take a photo and our AI automatically categorizes and routes your report to the right department.", color: "#3b82f6", icon: "📷" },
  { id: 2, title: "AI + GIS Intelligence", desc: "Advanced AI classification combined with GPS mapping to locate, prioritize, and track urban issues effectively.", color: "#10b981", icon: "📍" },
  { id: 3, title: "Live Status Updates", desc: "Get real-time updates on your reports with transparent tracking, just like delivery apps.", color: "#3b82f6", icon: "⏱️" },
  { id: 4, title: "Accountability Dashboard", desc: "Municipal bodies get dashboards with SLA timers, escalation alerts, and performance metrics.", color: "#10b981", icon: "🛡️" },
  { id: 5, title: "Smart City Integration", desc: "Seamlessly integrates with Smart City infrastructure for scalable urban management.", color: "#3b82f6", icon: "📊" },
  { id: 6, title: "Citizen-Centric Design", desc: "Built for every city and town, making civic participation accessible and effective for all citizens.", color: "#10b981", icon: "👥" }
];

export default function FeaturesPage() {
  const navigate = useNavigate();

  return (
    <div>
     
      <main className="features-page">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <button type="button" className="btn-back btn-ghost" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <section className="features-hero"><br/><br/>
          <h1>Turning citizen voices into government action</h1>
          <p className="hero-sub">Our AI-powered system streamlines the entire civic reporting process, from issue identification to resolution tracking.</p>
        </section>

        <section className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.id} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}