// src/pages/UserDashboard.jsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/UserHeader";
import "../styles/UserDashboard.css";
import { getUserStatistics, getIssues } from "../utils/api"; // Import API functions

/* Enhanced Stat card component */
function StatCard({ title, value, sub, trend, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-title">{title}</div>
        {icon && <div className="stat-icon">{icon}</div>}
      </div>
      <div className="stat-value">{value}</div>
      {sub && <div className={`stat-sub ${trend === 'down' ? 'negative' : 'positive'}`}>{sub}</div>}
    </div>
  );
}

/* Status pill */
function StatusPill({ status }) {
  const map = {
    Open: "pill-open",
    "In Progress": "pill-progress",
    Resolved: "pill-resolved",
    Urgent: "pill-urgent",
    Pending: "pill-pending",
  };
  return <span className={`status-pill ${map[status] || "pill-default"}`}>{status}</span>;
}

export default function UserDashboard({ user: propUser = null, onLogout }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    pending: 0,
    responseRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // get username
  const storedName = typeof window !== "undefined" ? localStorage.getItem("username") : null;
  const user = propUser || storedName || "Sarah";

  // Fetch real data from the API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Fetch user statistics
        const statsResponse = await getUserStatistics();
        const userStats = statsResponse.submittedIssues;
        
        // Update stats state
        const total = userStats.total;
        const resolved = userStats.byStatus.resolved;
        const inProgress = userStats.byStatus.inProgress;
        const pending = userStats.byStatus.pending;
        const responseRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
        
        setStats({
          total,
          resolved,
          inProgress,
          pending,
          responseRate
        });
        
        // Fetch user's reports
        const issuesResponse = await getIssues({ 
          limit: 20,
          sort: "submittedDate:desc"
        });
        
        // Transform issues data to match expected format
        const transformedReports = issuesResponse.data.map(issue => ({
          id: issue._id,
          title: issue.title,
          location: issue.location,
          date: new Date(issue.submittedDate).toLocaleDateString(),
          category: issue.department,
          status: issue.status === "in-progress" ? "In Progress" : 
                  issue.status === "resolved" ? "Resolved" : 
                  issue.status === "pending" ? "Pending" : 
                  issue.status,
          priority: issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1),
          image: issue.photo ? `http://localhost:5001${issue.photo}` : null,
          progress: issue.status === "resolved" ? 100 : 
                   issue.status === "in-progress" ? 65 : 
                   issue.status === "pending" ? 10 : 0,
          likes: 0, // Not implemented in backend
          assignedTo: issue.department
        }));
        
        setReports(transformedReports);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Enhanced filtering and searching
  const filteredReports = useMemo(() => {
    let filtered = filter === "All" ? reports : reports.filter((r) => r.category === filter);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((r) => 
        r.title.toLowerCase().includes(query) ||
        r.location.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query)
      );
    }
    
    return filtered.sort((a, b) => {
      // Sort by status priority: Urgent > In Progress > Open > Pending > Resolved
      const statusPriority = { "Urgent": 5, "In Progress": 4, "Open": 3, "Pending": 2, "Resolved": 1 };
      return (statusPriority[b.status] || 0) - (statusPriority[a.status] || 0);
    });
  }, [reports, filter, searchQuery]);

  const handleQuickAction = useCallback((action) => {
    switch (action) {
      case "report":
        navigate("/report-issue");
        break;
      case "myReports":
        navigate("/my-reports");
        break;
      case "community":
        navigate("/community");
        break;
      default:
        break;
    }
  }, [navigate]);

  // Use the provided onLogout or fallback to local implementation
  const handleLogout = useCallback(() => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback logout
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
      } catch (e) {
        console.error('Error clearing auth data:', e);
      }
      navigate("/login");
    }
  }, [onLogout, navigate]);

  if (loading) {
    return (
      <div className="dash-root">
        <Header onLogout={handleLogout} />
        <main className="dash-main">
          <div className="loading-spinner">Loading dashboard data...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-root">
        <Header onLogout={handleLogout} />
        <main className="dash-main">
          <div className="error-message">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dash-root">
      {/* ✅ Reused Header with logout handler */}
      <Header onLogout={handleLogout} />

      <main className="dash-main">
        {/* Welcome strip */}
        <section className="welcome-strip">
          <div className="welcome-text">
            <h2>Welcome back, {user}!</h2>
            <p>Here's what's happening in your community today.</p>
          </div>
        </section>

        {/* Enhanced Stats row */}
        <section className="stats-row">
          <div className="stats-grid">
            <StatCard 
              title="Total Reports" 
              value={stats.total.toLocaleString()} 
              sub={<small>+12% vs last month</small>} 
              icon="📊"
              trend="up"
            />
            <StatCard 
              title="Resolved Issues" 
              value={stats.resolved.toLocaleString()} 
              sub={<small>+8% vs last month</small>} 
              icon="✅"
              trend="up"
            />
            <StatCard 
              title="In Progress" 
              value={stats.inProgress.toLocaleString()} 
              sub={<small>+3% vs last month</small>} 
              icon="🔄"
              trend="up"
            />
            <StatCard 
              title="Response Rate" 
              value={`${stats.responseRate}%`} 
              sub={<small>+2% vs last month</small>} 
              icon="⚡"
              trend="up"
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button 
              className="action-card"
              onClick={() => handleQuickAction('report')}
            >
              <div className="action-icon">📝</div>
              <div className="action-content">
                <h4>Report Issue</h4>
                <p>Submit a new civic issue</p>
              </div>
            </button>
            <button 
              className="action-card"
              onClick={() => handleQuickAction('myReports')}
            >
              <div className="action-icon">📋</div>
              <div className="action-content">
                <h4>My Reports</h4>
                <p>Track your submissions</p>
              </div>
            </button>
            <button 
              className="action-card"
              onClick={() => handleQuickAction('community')}
            >
              <div className="action-icon">🏘️</div>
              <div className="action-content">
                <h4>Community</h4>
                <p>View local issues</p>
              </div>
            </button>
            <button 
              className="action-card"
              onClick={() => navigate('/feedback')}
            >
              <div className="action-icon">💬</div>
              <div className="action-content">
                <h4>Feedback</h4>
                <p>Share your suggestions</p>
              </div>
            </button>
          </div>
        </section>

        {/* Map / filters */}
        <section className="map-banner">
          <div className="map-inner">
            <div className="map-placeholder">
              <div className="map-content">
                <h4>🗺️ City Issues Heatmap</h4>
                <p>Interactive map visualization coming soon</p>
                <button 
                  className="btn primary small"
                  onClick={() => navigate('/community')}
                >
                  View Community Map
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Reports list */}
        <section className="recent-reports">
          <div className="reports-header">
            <h3>Recent Reports</h3>
            <div className="reports-controls">
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <select 
                value={viewMode} 
                onChange={(e) => setViewMode(e.target.value)}
                className="view-select"
              >
                <option value="grid">Grid View</option>
                <option value="list">List View</option>
              </select>
            </div>
          </div>
          
          <div className="map-filters">
            {["All", "Infrastructure", "Sanitation", "Traffic", "Utilities"].map((t) => (
              <button
                key={t}
                className={`filter-btn ${filter === t ? "active" : ""}`}
                onClick={() => setFilter(t)}
              >
                {t} {t !== "All" && `(${reports.filter(r => r.category === t).length})`}
              </button>
            ))}
          </div>
          
          <div className={`reports-list ${viewMode}`}>
            {filteredReports.length > 0 ? filteredReports.map((r) => (
              <div key={r.id} className="report-row" onClick={() => navigate(`/report/${r.id}`)}>
                <div className="thumb">
                  <div className="thumb-img">
                    {r.category === 'Infrastructure' ? '🏗️' : 
                     r.category === 'Sanitation' ? '🗑️' : 
                     r.category === 'Traffic' ? '🚦' : '⚡'}
                  </div>
                </div>
                <div className="report-body">
                  <div className="report-title">
                    {r.title}
                  </div>
                  <div className="report-meta">
                    <span>📍 {r.location}</span> • 
                    <span className="muted">📅 {r.date}</span> • 
                    <span className="assigned">👥 {r.assignedTo}</span>
                  </div>
                  {r.progress !== undefined && (
                    <div className="progress-container">
                      <div className="progress-bar-bg">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${r.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{r.progress}%</span>
                    </div>
                  )}
                </div>
                <div className="report-right">
                  <div className="priority">{r.priority}</div>
                  <StatusPill status={r.status} />
                  <div className="likes">👍 {r.likes}</div>
                </div>
              </div>
            )) : (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h4>No reports found</h4>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="dash-footer">
        <div className="footer-inner">
          <div className="footer-col">
            <h4>CivicConnect</h4>
            <p>
              Empowering citizens to improve their communities through technology
              and civic engagement.
            </p>
          </div>

          <div className="footer-col">
            <h5>Features</h5>
            <ul>
              <li>AI-Powered Categorization</li>
              <li>Real-time Tracking</li>
              <li>Community Engagement</li>
              <li>Analytics Dashboard</li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Support</h5>
            <ul>
              <li>Help Center</li>
              <li>Contact Us</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Connect</h5>
            <button className="btn small outline" onClick={() => navigate('/feedback')}>Feedback</button>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} CivicConnect. Built for stronger communities.
        </div>
      </footer>
    </div>
  );
}