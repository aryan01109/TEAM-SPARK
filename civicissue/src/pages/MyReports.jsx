import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/UserHeader";
import "../styles/MyReports.css";
import { getIssues } from "../utils/api"; // Import the API function

/* ---------- Sample data (myReports + communityReports) ---------- */
const myReportsSample = [
  {
    id: "CIV-2024-1231",
    title: "Large pothole on Main Street causing vehicle damage",
    location: "Main St & 5th Ave",
    date: "2024-12-07",
    dept: "Public Works",
    progress: 65,
    likes: 23,
    comments: 8,
    status: "in progress",
    priority: "high",
    category: "Infrastructure",
    image: "/images/pothole-sample.jpg",
    description: "Large pothole approximately 3 feet wide causing damage to vehicles and safety hazards.",
    timeline: [
      { status: "Submitted", by: "You", date: "2024-12-05", note: "Issue reported by citizen" },
      { status: "Acknowledged", by: "System", date: "2024-12-05", note: "Report received and logged" },
      { status: "Assigned", by: "Admin", date: "2024-12-06", note: "Assigned to Public Works Department" },
      { status: "In Progress", by: "Public Works", date: "2024-12-07", note: "Work crew dispatched to assess damage" },
    ],
  },
  {
    id: "CIV-2024-1225",
    title: "Broken streetlight creating safety hazard",
    location: "Oak Ave & 3rd St",
    date: "2024-12-03",
    dept: "Utilities Department",
    progress: 100,
    likes: 15,
    comments: 4,
    status: "resolved",
    priority: "medium",
    category: "Utilities",
    image: null,
    description: "Streetlight was reported as flickering and then went out entirely. Crew repaired the unit.",
    timeline: [
      { status: "Submitted", by: "You", date: "2024-12-01", note: "Issue reported by citizen" },
      { status: "Acknowledged", by: "System", date: "2024-12-01", note: "Report received" },
      { status: "Resolved", by: "Utilities", date: "2024-12-03", note: "Lamp replaced and tested" },
    ],
  },
];

const communityReportsSample = [
  {
    id: "CIV-2024-1301",
    title: "Overflowing garbage bins near central park",
    location: "Park Ave & 8th St",
    date: "2024-12-11",
    dept: "Sanitation",
    progress: 40,
    likes: 58,
    comments: 12,
    status: "in progress",
    priority: "medium",
    category: "Sanitation",
    description: "Multiple bins overflowing after weekend festival.",
    timeline: [
      { status: "Submitted", by: "Citizen", date: "2024-12-10", note: "Report filed" },
      { status: "Assigned", by: "Sanitation", date: "2024-12-11", note: "Scheduled cleanup" },
    ],
  },
];

const StatusPill = React.memo(({ status }) => {
  const map = {
    "in progress": "pill-progress",
    resolved: "pill-resolved",
    pending: "pill-pending",
    urgent: "pill-urgent",
  };
  return <span className={`status-pill ${map[status] || "pill-default"}`}>{status}</span>;
});

const PriorityPill = React.memo(({ text }) => {
  return <div className="priority-pill">{text}</div>;
});

const IssueDetailModal = React.memo(({ report, onClose }) => {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!report) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close details">×</button>

        <div className="modal-header">
          <h3 className="modal-title">{report.title}</h3>
          <div className="modal-sub">ID: {report.id}</div>
        </div>

        {report.image && (
          <div className="modal-image-wrap">
            <img src={report.image} alt={report.title} className="modal-image" />
          </div>
        )}

        <div className="modal-meta-grid">
          <div>
            <div className="meta-label">Status</div>
            <StatusPill status={report.status} />
          </div>

          <div>
            <div className="meta-label">Priority</div>
            <PriorityPill text={report.priority} />
          </div>

          <div>
            <div className="meta-label">Location</div>
            <div className="meta-value">{report.location}</div>
          </div>

          <div>
            <div className="meta-label">Department</div>
            <div className="meta-value">{report.dept}</div>
          </div>
        </div>

        <div className="modal-section">
          <h4 className="section-title">Description</h4>
          <p className="section-text">{report.description || "No description provided."}</p>
        </div>

        <div className="modal-section">
          <h4 className="section-title">Timeline</h4>
          <ol className="timeline-list">
            {(report.timeline || []).map((t, i) => (
              <li key={i} className="timeline-item">
                <div className="timeline-left">
                  <span className="timeline-dot" />
                </div>
                <div className="timeline-body">
                  <div className="timeline-head">
                    <div className="timeline-title">{t.status}</div>
                    <div className="timeline-date">{t.date}</div>
                  </div>
                  <div className="timeline-note">{t.note}</div>
                  <div className="timeline-by">by {t.by}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
});

export default function MyReports({ onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("my");
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [myReports, setMyReports] = useState([]); // Real data for my reports
  const [communityReports, setCommunityReports] = useState([]); // Real data for community reports

  // Fetch real data from the backend
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Get user info
        const auth = JSON.parse(localStorage.getItem("auth") || "null");
        const username = auth?.user?.username || "anonymous";
        
        // Fetch my reports (submitted by this user)
        const myReportsResponse = await getIssues({ 
          submittedBy: username,
          sort: "submittedDate:desc"
        });
        
        // Fetch all reports for community view
        const allReportsResponse = await getIssues({ 
          sort: "submittedDate:desc"
        });
        
        // Transform backend data to match frontend format
        const transformIssue = (issue) => ({
          id: issue.id,
          title: issue.title,
          location: issue.location,
          date: new Date(issue.submittedDate).toLocaleDateString(),
          dept: issue.department,
          progress: issue.status === "resolved" ? 100 : issue.status === "in-progress" ? 65 : 30,
          likes: issue.upvotes || 0,
          comments: issue.comments?.length || 0,
          status: issue.status,
          priority: issue.priority,
          category: issue.department,
          description: issue.description,
          timeline: [
            { 
              status: "Submitted", 
              by: issue.submittedBy || "Anonymous", 
              date: new Date(issue.submittedDate).toLocaleDateString(), 
              note: "Issue reported by citizen" 
            },
            // Add more timeline events based on issue status
            ...(issue.status === "in-progress" ? [{
              status: "In Progress", 
              by: issue.assignedTo || "Department", 
              date: new Date().toLocaleDateString(), 
              note: "Issue is being worked on"
            }] : []),
            ...(issue.status === "resolved" ? [{
              status: "Resolved", 
              by: issue.assignedTo || "Department", 
              date: new Date(issue.resolvedAt || Date.now()).toLocaleDateString(), 
              note: "Issue has been resolved"
            }] : [])
          ]
        });
        
        setMyReports(myReportsResponse.data.map(transformIssue));
        setCommunityReports(allReportsResponse.data.map(transformIssue));
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to load reports. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(timer);
  }, []);

  // Note: render loading/error state inside the main markup to avoid conditional hooks

  // Enhanced filtering and sorting with memoization
  const filteredAndSortedReports = useMemo(() => {
    const data = activeTab === "my" ? myReports : communityReports;
    
    let filtered = data.filter((r) => {
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || 
        r.title.toLowerCase().includes(q) || 
        r.id.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q);
      
      const matchesStatus = filterStatus === "all" || r.status === filterStatus;
      
      return matchesQuery && matchesStatus;
    });
    
    // Sort reports
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date) - new Date(a.date);
        case "title":
          return a.title.localeCompare(b.title);
        case "status":
          return a.status.localeCompare(b.status);
        case "priority":
          const priorityOrder = { "urgent": 3, "high": 2, "medium": 1, "low": 0 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [activeTab, query, filterStatus, sortBy, myReports, communityReports]);

  const handleExport = useCallback(() => {
    const data = activeTab === "my" ? myReportsSample : communityReportsSample;
    const csv = [
      ['ID', 'Title', 'Location', 'Date', 'Category', 'Status', 'Priority'],
      ...data.map(r => [r.id, r.title, r.location, r.date, r.category, r.status, r.priority])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeTab]);

  // bulk action helper removed (not used)

  return (
    <div className="page-content">
      <Header onLogout={onLogout} />
      <div className="page-container">
        {loading && <div className="loading-spinner">Loading reports...</div>}
        {error && <div className="error-message" role="alert">{error}</div>}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <button type="button" className="btn-back btn-ghost" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div className="header-section">
          <div className="header-content">
            <h2>Track Your Issues</h2>
            <p className="muted">Monitor the progress of civic issues in real-time.</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn outline small"
              onClick={handleExport}
              title="Export data"
              aria-label="Export reports data"
            >
              📊 Export
            </button>
            <button 
              className="btn primary small"
              onClick={() => navigate('/report-issue')}
              aria-label="Create new report"
            >
              ➕ New Report
            </button>
          </div>
        </div>

        <div className="tab-strip" role="tablist">
          <button 
            className={`tab ${activeTab === "my" ? "tab-active" : ""}`} 
            onClick={() => setActiveTab("my")}
            role="tab"
            aria-selected={activeTab === "my"}
            aria-controls="my-reports-panel"
          >
            My Reports ({myReportsSample.length})
          </button>
          <button 
            className={`tab ${activeTab === "community" ? "tab-active" : ""}`} 
            onClick={() => setActiveTab("community")}
            role="tab"
            aria-selected={activeTab === "community"}
            aria-controls="community-reports-panel"
          >
            Community Issues ({communityReportsSample.length})
          </button>
        </div>

        <div className="search-filter-row">
          <input
            aria-label="Search reports"
            placeholder="Search by ID, title, or location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
            aria-label="Sort reports"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="status">Sort by Status</option>
            <option value="priority">Sort by Priority</option>
          </select>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="urgent">Urgent</option>
          </select>
          <select 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)}
            className="view-select"
            aria-label="Change view mode"
          >
            <option value="card">Card View</option>
            <option value="list">List View</option>
            <option value="compact">Compact View</option>
          </select>
        </div>

        <div className="reports-stats">
          <div className="stat-item">
            <span className="stat-number">{filteredAndSortedReports.length}</span>
            <span className="stat-label">Total Found</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{filteredAndSortedReports.filter(r => r.status === 'resolved').length}</span>
            <span className="stat-label">Resolved</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{filteredAndSortedReports.filter(r => r.status === 'in progress').length}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{filteredAndSortedReports.filter(r => r.status === 'pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>

        <div className={`reports-grid ${viewMode}`} role="main" aria-live="polite">
          {filteredAndSortedReports.map((r) => (
            <article
              key={r.id}
              className="report-card clickable"
              onClick={() => setSelected(r)}
              aria-labelledby={`title-${r.id}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(r); } }}
            >
              <div className="report-thumb">
                <div className="thumb-img small" aria-hidden="true">
                  {r.category === 'Infrastructure' ? '🏗️' : 
                   r.category === 'Sanitation' ? '🗑️' : 
                   r.category === 'Utilities' ? '⚡' : 
                   r.category === 'Traffic' ? '🚦' : '📋'}
                </div>
              </div>

              <div className="report-center">
                <h3 id={`title-${r.id}`} className="report-title">
                  <Link 
                    to={`/report/${r.id}`} 
                    onClick={(e) => { e.preventDefault(); setSelected(r); }}
                    aria-describedby={`meta-${r.id}`}
                  >
                    {r.title}
                  </Link>
                </h3>

                <div id={`meta-${r.id}`} className="report-sub muted">
                  <span>🆔 {r.id}</span> • 
                  <span>📍 {r.location}</span> • 
                  <span>📅 {r.date}</span> • 
                  <span>🏢 {r.dept}</span>
                </div>

                <div style={{ marginTop: 10 }}>
                  <div className="progress-label">Progress</div>
                  <div 
                    className="progress-wrap" 
                    role="progressbar" 
                    aria-valuenow={r.progress} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                    aria-label={`Progress: ${r.progress}%`}
                  >
                    <div className="progress-bar" style={{ width: mounted ? `${r.progress}%` : "0%" }} />
                  </div>
                  <div className="progress-meta" style={{ marginTop: 6, color: "#6b7280", display: "flex", justifyContent: "space-between" }}>
                    <small>Est. completion: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</small>
                    <small>{r.progress}%</small>
                  </div>

                  <div className="report-stats" style={{ marginTop: 8, color: "#6b7280", display: "flex", gap: 12 }}>
                    <span aria-label={`${r.likes} likes`}>👍 {r.likes}</span>
                    <span aria-label={`${r.comments} comments`}>💬 {r.comments}</span>
                    {activeTab === 'community' && <span aria-label={`Reporter: ${r.timeline?.[0]?.by || 'Anonymous'}`}>👤 {r.timeline?.[0]?.by || 'Anonymous'}</span>}
                  </div>
                </div>
              </div>

              <div className="report-right">
                <StatusPill status={r.status} />
                <PriorityPill text={r.priority} />
              </div>
            </article>
          ))}
          
          {filteredAndSortedReports.length === 0 && (
            <div className="empty-state" role="status" aria-live="polite">
              <h3>No reports found</h3>
              <p>
                {query || filterStatus !== "all" 
                  ? "Try adjusting your search criteria or filters." 
                  : activeTab === "my" 
                    ? "You haven't submitted any reports yet." 
                    : "No community reports available."
                }
              </p>
              {(!query && filterStatus === "all" && activeTab === "my") && (
                <button 
                  className="btn primary"
                  onClick={() => navigate('/report-issue')}
                  aria-label="Create your first report"
                >
                  Create Your First Report
                </button>
              )}
            </div>
          )}
        </div>

        {selected && (
          <IssueDetailModal 
            report={selected} 
            onClose={() => setSelected(null)} 
          />
        )}
      </div>
    </div>
  );
}