// src/components/AdminDashboard.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import "../styles/AdminDashboard.css";
import AdminHeader from "../components/AdminHeader.jsx";
import { getAdminStatistics, getIssues, getDepartments } from "../utils/api"; // Import API functions
import { useNavigate } from "react-router-dom";

/* ---------- Inline simple SVG charts (no external libs) ---------- */

// Simple Line Chart (responsive with viewBox)
function SimpleLineChart({ data = [], keys = ["open", "resolved"], colors = ["#7C83FD", "#4ED6A6"], height = 200 }) {
  if (!data || !data.length) return <div style={{ height }}>No data</div>;

  const padding = 28;
  const w = 900; // viewBox width
  const h = height;
  const innerW = w - padding * 2;
  const innerH = h - padding * 2;

  const all = data.flatMap(d => keys.map(k => Number(d[k] || 0)));
  const max = Math.max(...all, 1);

  const x = i => padding + (i / (data.length - 1 || 1)) * innerW;
  const y = v => padding + (1 - (v / max)) * innerH;

  const gridYs = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height }}>
      <rect x="0" y="0" width={w} height={h} fill="transparent" />
      {gridYs.map((t, i) => (
        <line key={i} x1={padding} x2={w - padding} y1={padding + t * innerH} y2={padding + t * innerH} stroke="#eef2f6" strokeWidth={1} />
      ))}

      {keys.map((k, ki) => {
        const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d[k] || 0)}`).join(" ");
        return (
          <g key={k}>
            <path d={path} fill="none" stroke={colors[ki % colors.length]} strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round" />
            {data.map((d, i) => <circle key={i} cx={x(i)} cy={y(d[k] || 0)} r={3} fill={colors[ki % colors.length]} />)}
          </g>
        );
      })}

      {data.map((d, i) => (
        <text key={i} x={x(i)} y={h - 6} fontSize="11" textAnchor="middle" fill="#8b98a6">{d.month || d.x}</text>
      ))}
    </svg>
  );
}

// Simple Pie Chart (SVG)
function SimplePieChart({ data = [], colors = ["#7C83FD", "#4ED6A6", "#FFA94D", "#FF7A7A", "#C4D5FF"], size = 140 }) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = Math.min(cx, cy) - 6;
  let angle = -90;

  const arcs = data.map((d, i) => {
    const sweep = (d.value / total) * 360;
    const start = angle;
    const end = angle + sweep;
    angle += sweep;

    const polar = a => {
      const rad = (a * Math.PI) / 180;
      return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
    };
    const [sx, sy] = polar(start);
    const [ex, ey] = polar(end);
    const large = sweep > 180 ? 1 : 0;
    const dAttr = `M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey} Z`;
    return { dAttr, color: colors[i % colors.length], name: d.name, value: d.value };
  });

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((a, i) => <path key={i} d={a.dAttr} fill={a.color} stroke="#fff" strokeWidth={0.5} />)}
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#344454" }}>
            <span style={{ width: 12, height: 12, background: colors[i % colors.length], display: "inline-block", borderRadius: 3 }} />
            <div style={{ minWidth: 90 }}>{d.name}</div>
            <div style={{ color: "#6b7b89" }}>{Math.round((d.value / total) * 100)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Department stacked bar chart (SVG) ---------- */

function DepartmentBarChart({ data = [], keys = ["high", "medium", "low"], colors = ["#7ED6A6", "#FFB84D", "#FF7A00"], height = 240 }) {
  if (!data || !data.length) return <div style={{ height }}>No data</div>;

  const w = 1000;
  const h = height;
  const padding = 36;
  const innerW = w - padding * 2;
  const innerH = h - padding * 2;

  // compute sums and max
  const totals = data.map(d => keys.reduce((s, k) => s + (d[k] || 0), 0));
  const max = Math.max(...totals, 1);

  // bar width and spacing
  const gap = 28;
  const barW = Math.max(28, innerW / data.length - gap);

  // x position for ith bar
  const xPos = i => padding + i * (barW + gap);

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${Math.max(w, padding * 2 + data.length * (barW + gap))} ${h}`} style={{ width: "100%", height }}>
        <rect x="0" y="0" width="100%" height="100%" fill="transparent" />

        {/* horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line key={i} x1={padding} x2={Math.max(w, padding * 2 + data.length * (barW + gap)) - padding} y1={padding + t * innerH} y2={padding + t * innerH} stroke="#eef2f6" strokeWidth={1} />
        ))}

        {/* bars */}
        {data.map((d, i) => {
          let yAcc = padding + innerH; // start from bottom (SVG y increases down)
          return (
            <g key={i}>
              {keys.map((k, ki) => {
                const v = d[k] || 0;
                const hBar = (v / max) * innerH;
                const y = yAcc - hBar;
                const x = xPos(i);
                yAcc -= hBar;
                return (
                  <rect
                    key={k}
                    x={x}
                    y={y}
                    width={barW}
                    height={hBar}
                    fill={colors[ki % colors.length]}
                    rx={4}
                  />
                );
              })}

              {/* label */}
              <text x={xPos(i) + barW / 2} y={h - 8} fontSize="11" textAnchor="middle" fill="#8b98a6">
                {d.department}
              </text>

              {/* numeric total (optional) */}
              <text x={xPos(i) + barW / 2} y={padding - 6} fontSize="11" textAnchor="middle" fill="#6b7b89">
                {totals[i]}
              </text>
            </g>
          );
        })}

        {/* Y axis ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const value = Math.round((1 - t) * max);
          return (
            <text key={i} x={8} y={padding + t * innerH + 4} fontSize="11" fill="#9aa8b6">{value}</text>
          );
        })}
      </svg>

      {/* legend */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", paddingTop: 10 }}>
        {keys.map((k, i) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 14, height: 14, background: colors[i % colors.length], display: "inline-block", borderRadius: 3 }} />
            <div style={{ fontSize: 13, color: "#344454" }}>{k.charAt(0).toUpperCase() + k.slice(1)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- ReportsPanel (tiles for Reports tab) ---------- */

function ReportsPanel({ onExport = (type) => alert(`Export: ${type}`) }) {
  const tiles = [
    { key: "monthly", title: "Monthly Summary", icon: "📅" },
    { key: "performance", title: "Performance Analytics", icon: "📈" },
    { key: "department", title: "Department Reports", icon: "👥" },
    { key: "issue", title: "Issue Analysis", icon: "⚠️" },
  ];

  return (
    <div className="reports-root">
      <div className="card reports-card">
        <div className="card-head">
          <h4>Export Reports</h4>
        </div>

        <div className="reports-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {tiles.map(t => (
            <button
              key={t.key}
              className="report-tile"
              onClick={() => onExport(t.key)}
              type="button"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: 18,
                borderRadius: 8,
                background: "#fbfdff",
                border: "1px solid rgba(30, 48, 60, 0.06)",
                boxShadow: "0 1px 0 rgba(15, 35, 55, 0.02)",
                cursor: "pointer",
                transition: "transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s",
                textAlign: "center",
                minHeight: 54,
                color: "#22323b"
              }}
            >
              <div className="tile-icon" style={{ fontSize: 18 }}>{t.icon}</div>
              <div className="tile-title" style={{ fontSize: 13, color: "#51656f" }}>{t.title}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- DepartmentsPanel (Option A) ---------- */

function DepartmentsPanel({ data = [] }) {
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState("total"); // total | high | medium | low

  const enriched = data.map(d => ({
    ...d,
    total: (d.high || 0) + (d.medium || 0) + (d.low || 0)
  }));

  const filtered = enriched
    .filter(d => d.department.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => {
      if (sort === "total") return b.total - a.total;
      return (b[sort] || 0) - (a[sort] || 0);
    });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            placeholder="Search department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #e6eef3" }}
          />
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: 8, borderRadius: 8 }}>
            <option value="total">Sort by total</option>
            <option value="high">Sort by high</option>
            <option value="medium">Sort by medium</option>
            <option value="low">Sort by low</option>
          </select>
        </div>

        <div style={{ color: "#6b7b89", fontSize: 13 }}>
          Total departments: <strong>{filtered.length}</strong>
        </div>
      </div>

      <div className="card" style={{ padding: 12, marginBottom: 16 }}>
        <h4 style={{ margin: "6px 0 12px 0" }}>Department Performance</h4>
        <div style={{ width: "100%", height: 300 }}>
          <DepartmentBarChart data={filtered} keys={["high","medium","low"]} />
        </div>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <h5 style={{ marginBottom: 10 }}>Departments</h5>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          {filtered.map(d => (
            <div key={d.department} style={{ borderRadius: 8, padding: 10, background: "#fff", boxShadow: "0 1px 2px rgba(20,30,40,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontWeight: 600 }}>{d.department}</div>
                <div style={{ color: "#6b7b89", fontSize: 13 }}>{d.total}</div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ width: 10, height: 10, background: "#7ED6A6", display: "inline-block", borderRadius: 3 }} />
                  <div>High: <strong>{d.high || 0}</strong></div>
                </div>

                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ width: 10, height: 10, background: "#FFB84D", display: "inline-block", borderRadius: 3 }} />
                  <div>Medium: <strong>{d.medium || 0}</strong></div>
                </div>

                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ width: 10, height: 10, background: "#FF7A00", display: "inline-block", borderRadius: 3 }} />
                  <div>Low: <strong>{d.low || 0}</strong></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- AdminDashboard component ---------- */
export default function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();
  const [range, setRange] = useState("90"); // Last 90 days
  // Show Feedback tab by default per admin request
  const [tab, setTab] = useState("feedback");
  // eslint-disable-next-line no-unused-vars
  const [q, setQ] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [dept, setDept] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // State for real data
  const [statistics, setStatistics] = useState(null);
  const [issues, setIssues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [monthlyTrendsData, setMonthlyTrendsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);

  // Fetch real data from the backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Fetch admin statistics
        const statsResponse = await getAdminStatistics();
        setStatistics(statsResponse);
        
        // Fetch recent issues
        const issuesResponse = await getIssues({ 
          limit: 10, 
          sort: "submittedDate:desc",
          status: "pending,in-progress"
        });
        setIssues(issuesResponse.data || []);
        
        // Fetch departments
        const departmentsResponse = await getDepartments();
        setDepartments(departmentsResponse || []);
        
        // Transform statistics data for charts
        // Monthly Trends Data from backend
        const monthlyData = statsResponse.monthlyTrends && statsResponse.monthlyTrends.length > 0 
          ? statsResponse.monthlyTrends.map(item => ({
              month: `${item._id.month}/${item._id.year}`,
              open: item.count,
              resolved: Math.floor(item.count * 0.7) // Simulated resolved count
            }))
          : [
              { month: "Jul", open: statsResponse.issuesByStatus?.pending || 0, resolved: statsResponse.issuesByStatus?.resolved || 0 },
              { month: "Aug", open: (statsResponse.issuesByStatus?.pending || 0) + 10, resolved: (statsResponse.issuesByStatus?.resolved || 0) + 5 },
              { month: "Sep", open: (statsResponse.issuesByStatus?.pending || 0) + 20, resolved: (statsResponse.issuesByStatus?.resolved || 0) + 15 },
              { month: "Oct", open: (statsResponse.issuesByStatus?.pending || 0) + 35, resolved: (statsResponse.issuesByStatus?.resolved || 0) + 30 },
              { month: "Nov", open: (statsResponse.issuesByStatus?.pending || 0) + 50, resolved: (statsResponse.issuesByStatus?.resolved || 0) + 50 },
              { month: "Dec", open: (statsResponse.issuesByStatus?.pending || 0) + 30, resolved: (statsResponse.issuesByStatus?.resolved || 0) + 25 },
            ];
        setMonthlyTrendsData(monthlyData);
        
        // Categories Data from departments
        const categories = (departmentsResponse || []).map(dept => ({
          name: dept.name,
          value: statsResponse.topDepartments?.find(d => d._id === dept.name)?.count || 0
        }));
        setCategoriesData(categories);
        
        // Department Performance Data
        const deptPerformance = (departmentsResponse || []).map(dept => {
          const deptStats = statsResponse.departmentPriorityStats?.find(d => d._id === dept.name);
          if (deptStats) {
            const priorities = deptStats.priorities.reduce((acc, curr) => {
              acc[curr.priority] = curr.count;
              return acc;
            }, {});
            
            return {
              department: dept.name,
              high: priorities.high || 0,
              medium: priorities.medium || 0,
              low: priorities.low || 0
            };
          }
          
          // Fallback if no department stats
          return {
            department: dept.name,
            high: statsResponse.issuesByPriority?.high || 0,
            medium: statsResponse.issuesByPriority?.medium || 0,
            low: statsResponse.issuesByPriority?.low || 0
          };
        });
        setDepartmentData(deptPerformance);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (issues || []).filter(i => (dept === "All" || i.department === dept) && (!s || i.title.toLowerCase().includes(s) || i._id.toLowerCase().includes(s)));
  }, [q, dept, issues]);

  // summary stats from real data
  const stats = {
    avgResponse: statistics?.avgResponseTime || "3.1 days",
    resolutionRate: statistics?.resolutionRate || "82%",
    satisfaction: statistics?.citizenSatisfaction || "4.2 / 5",
    active: statistics?.totals?.issues || 0,
  };

  // sample export handler used by ReportsPanel
  const handleExport = (type) => {
    // implement real export logic here (call API or generate CSV/PDF)
    alert(`Export requested: ${type}`);
  };

  const handleQuickAction = useCallback((action) => {
    switch (action) {
      case "manage":
        navigate("/admin/manage-issues");
        break;
      case "departments":
        navigate("/admin/departments");
        break;
      case "map":
        navigate("/admin/map");
        break;
      case "feedback":
        setTab("feedback");
        break;
      default:
        break;
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="admin-dashboard-root">
        <AdminHeader active="dashboard" onLogout={onLogout} />
        <div className="admin-body">
          <div className="loading-spinner">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-root">
        <AdminHeader active="dashboard" onLogout={onLogout} />
        <div className="admin-body">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-root">
      <AdminHeader active="dashboard" onLogout={onLogout} />

      <div className="admin-body">
        <aside className="sidebar">
          <div className="side-card small">
            <h4>System Status</h4>
            <ul className="status-list">
              <li><strong>Active Issues</strong><span className="pill red">{statistics?.totals?.issues || 0}</span></li>
              <li><strong>Urgent</strong><span className="pill orange">{statistics?.issuesByPriority?.critical || 0}</span></li>
              <li><strong>Resolved Today</strong><span className="pill green">{statistics?.resolvedToday || 0}</span></li>
              <li><strong>Response Time</strong><span className="pill">{stats.avgResponse}</span></li>
            </ul>
          </div> 

          <div className="side-card nav">
            <ul>
              <li className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>Overview</li>
              <li className={tab === "departments" ? "active" : ""} onClick={() => setTab("departments")}>Departments</li>
              <li className={tab === "analytics" ? "active" : ""} onClick={() => setTab("analytics")}>Analytics</li>
              <li className={tab === "reports" ? "active" : ""} onClick={() => setTab("reports")}>Reports</li>
              <li className={tab === "feedback" ? "active" : ""} onClick={() => setTab("feedback")}>Feedback</li>
            </ul>
          </div>

          <div className="side-card small">
            <h5>Recent Alerts</h5>
            <div className="muted">Water main break reported</div>
            <div className="muted">High volume of reports in downtown</div>
            <div className="muted">Scheduled maintenance completed</div>
          </div>

          <div className="side-card small">
            <h5>Department Status</h5>
            <ul className="dept-list">
              {(departments || []).slice(0, 4).map(dept => (
                <li key={dept._id}>
                  {dept.name} 
                  <span className="badge">
                    {dept.issueCount || 0}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="main-col">
          {/* --- Page title + top controls --- */}
          <div className="page-top">
            <div className="page-title">
              <h2>Admin Dashboard</h2>
              <div className="page-sub">Municipal operations overview and analytics</div>
            </div>

            <div className="page-controls">
              <div className="select-wrap">
                <select value={range} onChange={(e) => setRange(e.target.value)}>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last 365 days</option>
                </select>
              </div>

              <button className="btn outline small icon-left" onClick={() => alert("Open filters (implement as needed)")}>
                <span style={{ marginRight: 8 }}>⚙️</span> Filter
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <section className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <button 
                className="action-card"
                onClick={() => handleQuickAction('manage')}
              >
                <div className="action-icon">📋</div>
                <div className="action-content">
                  <h4>Manage Issues</h4>
                  <p>View and resolve reports</p>
                </div>
              </button>
              <button 
                className="action-card"
                onClick={() => handleQuickAction('departments')}
              >
                <div className="action-icon">👥</div>
                <div className="action-content">
                  <h4>Departments</h4>
                  <p>Manage departments</p>
                </div>
              </button>
              <button 
                className="action-card"
                onClick={() => handleQuickAction('map')}
              >
                <div className="action-icon">🗺️</div>
                <div className="action-content">
                  <h4>Map View</h4>
                  <p>Visualize issues</p>
                </div>
              </button>
              <button 
                className="action-card"
                onClick={() => handleQuickAction('feedback')}
              >
                <div className="action-icon">💬</div>
                <div className="action-content">
                  <h4>Feedback</h4>
                  <p>View user feedback</p>
                </div>
              </button>
            </div>
          </section>

          {/* Top stat cards */}
          <section className="top-cards">
            <div className="card stat">
              <div className="stat-label">Average Response Time</div>
              <div className="stat-value">{stats.avgResponse}</div>
              <div className="stat-delta" style={{ color: "#16a34a" }}>↗︎ -12%</div>
              <div className="stat-sub small muted">Time from report to first response</div>
            </div>

            <div className="card stat">
              <div className="stat-label">Resolution Rate</div>
              <div className="stat-value">{stats.resolutionRate}</div>
              <div className="stat-delta" style={{ color: "#16a34a" }}>↗︎ +5%</div>
              <div className="stat-sub small muted">Issues resolved within SLA</div>
            </div>

            <div className="card stat">
              <div className="stat-label">Citizen Satisfaction</div>
              <div className="stat-value">{stats.satisfaction}</div>
              <div className="stat-delta" style={{ color: "#16a34a" }}>↗︎ +0.3</div>
              <div className="stat-sub small muted">Average rating from feedback</div>
            </div>

            <div className="card stat">
              <div className="stat-label">Active Issues</div>
              <div className="stat-value">{stats.active}</div>
              <div className="stat-delta" style={{ color: "#16a34a" }}>↗︎ +8</div>
              <div className="stat-sub small muted">Currently pending or in progress</div>
            </div>
          </section>

          {/* Tab pill bar */}
          <section className="tab-bar-row">
            <div className={`tab-pill ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>Overview</div>
            <div className={`tab-pill ${tab === "departments" ? "active" : ""}`} onClick={() => setTab("departments")}>Departments</div>
            <div className={`tab-pill ${tab === "analytics" ? "active" : ""}`} onClick={() => setTab("analytics")}>Analytics</div>
            <div className={`tab-pill ${tab === "reports" ? "active" : ""}`} onClick={() => setTab("reports")}>Reports</div>
            <div className={`tab-pill ${tab === "feedback" ? "active" : ""}`} onClick={() => setTab("feedback")}>Feedback</div>
          </section>

          {/* Content area (switch by tab) */}
          {tab === "overview" && (
            <>
              {/* existing overview charts: Monthly Trends + Issue Categories */}
              <section className="overview-row">
                <div className="card chart wide">
                  <div className="card-head"><h4>Monthly Trends</h4></div>
                  <div style={{ width: "100%", height: 220 }}>
                    <SimpleLineChart data={monthlyTrendsData} keys={["open", "resolved"]} />
                  </div>
                </div>

                <div className="card chart">
                  <div className="card-head"><h4>Issue Categories</h4></div>
                  <div style={{ width: "100%", height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <SimplePieChart data={categoriesData} size={160} />
                  </div>
                </div>
              </section>

              {/* small department summary under overview (optional) */}
              <section className="overview-row" style={{ marginTop: 18 }}>
                <div className="card chart wide">
                  <div className="card-head"><h4>Department Performance (summary)</h4></div>
                  <div style={{ width: "100%", height: 220 }}>
                    <DepartmentBarChart data={departmentData} keys={["high","medium","low"]} />
                  </div>
                </div>
              </section>
            </>
          )}

          {tab === "departments" && <DepartmentsPanel data={departmentData} />}
          {tab === "analytics" && (
            <div className="card">
              <div className="card-head">
                <h4>Analytics Dashboard</h4>
                <p>Detailed analytics and performance metrics</p>
              </div>
              <div className="analytics-content">
                <div className="chart-container">
                  <h5>Response Time Distribution</h5>
                  <div style={{ width: "100%", height: 300 }}>
                    <SimpleLineChart data={monthlyTrendsData} keys={["open", "resolved"]} />
                  </div>
                </div>
              </div>
            </div>
          )}
          {tab === "reports" && <ReportsPanel onExport={handleExport} />}
          {tab === "feedback" && <FeedbackPanel />}

          {/* Recent High Priority Issues (always shown below tabs) */}
          <section className="recent-issues card" style={{ marginTop: 16 }}>
            <div className="card-head">
              <h4>Recent High Priority Issues</h4>
            </div>

            <div className="issue-list">
              {(filtered || []).map(it => (
                <div className="issue-row" key={it._id}>
                  <div className="issue-left">
                    <div className="issue-title">{it.title} <span className="badge small">{it.status}</span></div>
                    <div className="issue-meta small muted">{it._id} • {it.department} • Assigned to: {it.assignedTo || "Unassigned"}</div>
                  </div>

                  <div className="issue-right">
                    <div className="small muted">{new Date(it.submittedDate).toLocaleString()}</div>
                    <button className="btn outline small">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          
        </main>

        
      </div>

    </div>
  );
}

/* ---------- FeedbackPanel ---------- */

function FeedbackPanel() {
  const [feedback, setFeedback] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      setError("");
      try {
        // For now, we'll fetch all issues with "feedback" tag
        // In a real implementation, you would have a dedicated feedback endpoint
        const response = await getIssues({ 
          limit: 20, 
          sort: "submittedDate:desc"
        });
        
        // Filter for feedback issues (those with "feedback" tag)
        const feedbackIssues = (response.data || []).filter(issue => 
          issue.tags && issue.tags.includes("feedback")
        );
        
        setFeedback(feedbackIssues);
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError("Failed to load feedback. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) {
    return <div className="loading-spinner">Loading feedback...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="card">
      <div className="card-head">
        <h4>User Feedback</h4>
        <p>Feedback and suggestions from citizens</p>
      </div>
      
      <div className="feedback-list">
        {feedback.length === 0 ? (
          <div className="empty-state">
            <p>No feedback received yet.</p>
          </div>
        ) : (
          <div className="feedback-items">
            {feedback.map((item) => (
              <div key={item._id} className="feedback-item">
                <div className="feedback-header">
                  <div className="feedback-title">{item.title.replace("[Feedback] ", "")}</div>
                  <div className="feedback-rating">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`star ${i < (item.citizenRating || 0) ? "filled" : ""}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div className="feedback-meta">
                  <span className="feedback-author">By {item.submittedBy}</span>
                  <span className="feedback-date">
                    {new Date(item.submittedDate).toLocaleDateString()}
                  </span>
                  <span className="feedback-type">
                    {item.tags && item.tags.length > 1 ? item.tags[1] : "General"}
                  </span>
                </div>
                <div className="feedback-content">
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
