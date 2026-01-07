import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getComments, addComment as apiAddComment } from "../utils/api";

export default function IssueCard({ issue }) {
  const [isSupported, setIsSupported] = useState(false);
  const [supportCount, setSupportCount] = useState(issue.supporters);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(issue.comments || []);
  const [newComment, setNewComment] = useState("");
  const navigate = useNavigate();

  const initials = issue.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSupport = useCallback((e) => {
    e.stopPropagation();
    if (!isSupported) {
      setIsSupported(true);
      setSupportCount(prev => prev + 1);
      // Here you would typically make an API call
      console.log(`Supporting issue ${issue.id}`);
    }
  }, [isSupported, issue.id]);

  const handleCardClick = useCallback(() => {
    // Navigate to issue detail page
    navigate(`/issue/${issue.id}`);
  }, [navigate, issue.id]);

  const handleShare = useCallback((e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: issue.title,
        text: issue.description,
        url: window.location.origin + `/issue/${issue.id}`
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(
        `${issue.title} - ${window.location.origin}/issue/${issue.id}`
      );
      alert('Link copied to clipboard!');
    }
  }, [issue]);

  const handleToggleComments = useCallback((e) => {
    e.stopPropagation();
    setShowComments((s) => !s);
    // If opening and no comments yet, fetch from API
    if (!showComments && (!comments || comments.length === 0)) {
      (async () => {
        try {
          const data = await getComments(issue.id);
          const mapped = (data || []).map((c, idx) => ({ id: c._id || idx, author: c.createdBy || 'Anonymous', text: c.text, timeAgo: new Date(c.createdAt).toLocaleString() }));
          setComments(mapped.reverse());
        } catch (err) {
          console.error('Failed to load comments', err);
        }
      })();
    }
  }, [showComments, comments, issue.id]);

  const handleAddComment = useCallback((e) => {
    e.stopPropagation();
    const text = newComment && newComment.trim();
    if (!text) return;
    const username = localStorage.getItem('username') || 'You';
    const optimistic = { id: Date.now(), author: username, text, timeAgo: 'just now' };
    setComments((c) => [optimistic, ...c]);
    setNewComment('');
    (async () => {
      try {
        const res = await apiAddComment(issue.id, text);
        // replace optimistic item id with server-provided id if available
        setComments((cur) => cur.map((it) => (it.id === optimistic.id ? { ...it, id: res._id || res.id || it.id, timeAgo: new Date(res.createdAt).toLocaleString() } : it)));
      } catch (err) {
        console.error('Failed to post comment', err);
        // remove optimistic comment on failure
        setComments((cur) => cur.filter((it) => it.id !== optimistic.id));
        alert('Failed to post comment. Please try again.');
      }
    })();
  }, [newComment, issue.id]);

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '📋';
      default: return '📋';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'infrastructure': return '🏗️';
      case 'sanitation': return '🗑️';
      case 'roads': return '🛣️';
      case 'water': return '💧';
      case 'electricity': return '⚡';
      case 'safety': return '🚨';
      default: return '📍';
    }
  };

  return (
    <article 
      className={`issue-card ${issue.priority === 'high' ? 'high-priority' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      aria-label={`View details for ${issue.title}`}
    >
      <div className="card-top">
        <div className="user-info">
          <div className="avatar">{initials}</div>
          <div className="meta">
            <div className="meta-name">{issue.name}</div>
            <div className="meta-time">📅 {issue.timeAgo}</div>
          </div>
        </div>
        <div className="card-actions">
          <button 
            className="action-btn share-btn"
            onClick={handleShare}
            aria-label="Share this issue"
            title="Share issue"
          >
            📤
          </button>
          <div className="priority-indicator" title={`${issue.priority} priority`}>
            {getPriorityIcon(issue.priority)}
          </div>
        </div>
      </div>

      <div className="card-content">
        <div className="issue-header">
          <span className="category-badge">
            {getCategoryIcon(issue.category)} {issue.category}
          </span>
          <span className={`status-badge status-${issue.statusColor}`}>
            {issue.status}
          </span>
        </div>
        
        <h3 className="issue-title">{issue.title}</h3>
        <p className="issue-desc">{issue.description}</p>
        
        {issue.images && (
          <div className="media-info">
            📷 {issue.images} {issue.images === 1 ? 'photo' : 'photos'}
          </div>
        )}
      </div>

      <div className="card-bottom">
        <div className="location-info">
          <span className="location">📍 {issue.location}</span>
        </div>
        
        <div className="engagement-actions">
          <button 
            className={`support-btn ${isSupported ? 'supported' : ''}`}
            onClick={handleSupport}
            disabled={isSupported}
            aria-label={isSupported ? 'Already supported' : 'Support this issue'}
            title={isSupported ? 'Already supported' : 'Support this issue'}
          >
            <span className="support-icon">{isSupported ? '💚' : '👍'}</span>
            <span className="support-count">{supportCount}</span>
          </button>
          
          <div className="comment-wrapper">
            <button
              className="comment-btn"
              onClick={handleToggleComments}
              aria-label="Toggle comments"
              title="Toggle comments"
            >
              💬 Comment
            </button>
            {showComments && (
              <div className="comments-panel" onClick={(e) => e.stopPropagation()}>
                <div className="add-comment">
                  <input
                    className="comment-input"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(e); }}
                    aria-label="Add a comment"
                  />
                  <button className="btn btn-small" onClick={handleAddComment} aria-label="Submit comment">Send</button>
                </div>
                <div className="comments-list">
                  {comments.length === 0 ? (
                    <div className="no-comments">No comments yet. Be the first!</div>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="comment-item">
                        <div className="comment-author">{c.author}</div>
                        <div className="comment-text">{c.text}</div>
                        <div className="comment-time">{c.timeAgo}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="view-indicator">
            👁️ View Details
          </div>
        </div>
      </div>
    </article>
  );
}
