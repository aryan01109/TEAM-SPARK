import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import IssueCard from "./IssueCard";
import "../styles/community.css";

export default function CommunitySection() {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const navigate = useNavigate();

  // Enhanced sample data with more realistic content
  const issues = useMemo(() => [
    {
      id: 1,
      name: "Priya Sharma",
      title: "Broken Streetlight on C.G. Road",
      description:
        "The streetlight near the municipal market has been out for three days, creating a safety hazard at night. Multiple residents have reported near-miss accidents.",
      timeAgo: "2 hours ago",
      location: "Navrangpura, Ahmedabad",
      supporters: 12,
      status: "New",
      statusColor: "pink",
      priority: "high",
      category: "infrastructure",
      images: 2
    },
    {
      id: 2,
      name: "Arjun Verma",
      title: "Garbage overflow at Law Garden",
      description:
        "The public dustbins near the garden entrance are overflowing and haven't been cleared for a week. This is causing health concerns and attracting stray animals.",
      timeAgo: "1 day ago",
      location: "Law Garden, Ahmedabad",
      supporters: 28,
      status: "In Progress",
      statusColor: "yellow",
      priority: "medium",
      category: "sanitation",
      images: 3
    },
    {
      id: 3,
      name: "Anika Reddy",
      title: "Pothole near City Library",
      description:
        "Large pothole on the corner near the library causing vehicles to swerve. Needs urgent repair before someone gets seriously injured.",
      timeAgo: "3 days ago",
      location: "Ellisbridge, Ahmedabad",
      supporters: 46,
      status: "Open",
      statusColor: "blue",
      priority: "high",
      category: "roads",
      images: 1
    },
    {
      id: 4,
      name: "Rajesh Kumar",
      title: "Broken Water Pipe at Bus Stop",
      description:
        "Water pipe has been leaking for weeks, creating muddy conditions and making the bus stop unusable during rain.",
      timeAgo: "5 days ago",
      location: "Maninagar, Ahmedabad",
      supporters: 34,
      status: "Resolved",
      statusColor: "green",
      priority: "medium",
      category: "water",
      images: 2
    }
  ], []);

  // Filter and sort logic
  const filteredAndSortedIssues = useMemo(() => {
    let filtered = issues;
    
    // Apply filter
    if (filter !== 'all') {
      filtered = issues.filter(issue => 
        filter === 'active' 
          ? ['New', 'In Progress', 'Open'].includes(issue.status)
          : issue.status.toLowerCase() === filter.toLowerCase()
      );
    }
    
    // Apply sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'supporters':
          return b.supporters - a.supporters;
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'recent':
        default:
          return a.id - b.id; // Assuming higher ID = more recent
      }
    });
  }, [issues, filter, sortBy]);

  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
  }, []);

  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
  }, []);

  const handleReportIssue = useCallback(() => {
    navigate('/report');
  }, [navigate]);

  const handleViewAll = useCallback(() => {
    navigate('/community');
  }, [navigate]);

  return (
    <section className="community-section">
      <div className="section-header">
        <div className="header-content">
          <h2 className="section-title">Community Reports</h2>
          <p className="section-subtitle">
            See what your neighbors are reporting and join the effort to improve our community
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-outline btn-small"
            onClick={handleViewAll}
            aria-label="View all community reports"
          >
            View All
          </button>
          <button 
            className="btn btn-primary btn-small"
            onClick={handleReportIssue}
            aria-label="Report a new issue"
          >
            <span>📝</span>
            Report Issue
          </button>
        </div>
      </div>

      <div className="filters-toolbar">
        <div className="filter-group">
          <label className="filter-label">Filter:</label>
          <div className="filter-buttons">
            {[
              { key: 'all', label: 'All', count: issues.length },
              { key: 'active', label: 'Active', count: issues.filter(i => ['New', 'In Progress', 'Open'].includes(i.status)).length },
              { key: 'resolved', label: 'Resolved', count: issues.filter(i => i.status === 'Resolved').length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                className={`filter-btn ${filter === key ? 'active' : ''}`}
                onClick={() => handleFilterChange(key)}
                aria-label={`Filter by ${label}`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>
        
        <div className="sort-group">
          <label className="sort-label">Sort by:</label>
          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            aria-label="Sort issues by"
          >
            <option value="recent">Most Recent</option>
            <option value="supporters">Most Supported</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      <div className="community-stats">
        <div className="stat">
          <span className="stat-number">{filteredAndSortedIssues.length}</span>
          <span className="stat-label">Issues Showing</span>
        </div>
        <div className="stat">
          <span className="stat-number">{filteredAndSortedIssues.reduce((sum, issue) => sum + issue.supporters, 0)}</span>
          <span className="stat-label">Total Supporters</span>
        </div>
        <div className="stat">
          <span className="stat-number">{issues.filter(i => i.status === 'Resolved').length}</span>
          <span className="stat-label">Resolved</span>
        </div>
      </div>

      <div className="community-list">
        {filteredAndSortedIssues.length > 0 ? (
          filteredAndSortedIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))
        ) : (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3>No issues found</h3>
            <p>Try adjusting your filters or be the first to report an issue in this category.</p>
            <button 
              className="btn btn-primary"
              onClick={handleReportIssue}
            >
              Report First Issue
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
