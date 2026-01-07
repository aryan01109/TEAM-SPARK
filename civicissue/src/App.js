// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { checkAuthStatus, setAuthData, clearAuthData, isValidToken } from "./utils/auth.js";

// Import mobile styles
import "./styles/mobile.css";

// Public Pages
import LoginPage from "./pages/LoginPage.jsx";
import Register from "./pages/Register.jsx";
// Removed unused imports to clean up lint warnings

// User Pages
import UserDashboard from "./pages/UserDashboard.jsx";
import MyReports from "./pages/MyReports.jsx";
import ReportIssue from "./pages/ReportIssue.jsx";
import CommunityPage from "./pages/CommunityPage.jsx";
import UserProfile from "./pages/UserProfile.jsx";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ManageIssues from "./pages/ManageIssues.jsx";
import AdminMapLeaflet from "./pages/AdminMapLeaflet.jsx";
import ManageDepartments from "./pages/ManageDepartments.jsx";

// Settings Pages
import UserSettings from "./pages/UserSettings.jsx";
import AdminSettings from "./pages/AdminSettings.jsx";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [role, setRole] = useState(null); // 'admin' | 'user' | null

  useEffect(() => {
    // Restore saved authentication and role on app load
    const authStatus = checkAuthStatus();
    
    // Additional validation to ensure token is actually valid
    if (authStatus.isAuthenticated && authStatus.token && isValidToken(authStatus.token)) {
      setIsAuth(true);
      setRole(authStatus.userRole);
    } else {
      // Clean up any invalid auth data
      clearAuthData();
      setIsAuth(false);
      setRole(null);
    }
    setLoading(false);
  }, []);

  // Handle user login
  const handleLogin = (token, userRole = "user") => {
    if (token && token !== 'undefined') {
      setAuthData(token, userRole);
      setIsAuth(true);
      setRole(userRole);
    }
  };

  // Handle user logout
  const handleLogout = () => {
    clearAuthData();
    setIsAuth(false);
    setRole(null);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        Loading CivicConnect...
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
        {/* Public Routes - Accessible to everyone */}
        <Route 
          path="/" 
          element={<LoginPage onLogin={handleLogin} />}
        />
        
        {/* Authentication Routes - Allow access from landing page */}
        <Route 
          path="/login" 
          element={<LoginPage onLogin={handleLogin} />}
        />
        <Route 
          path="/register" 
          element={<Register onRegister={handleLogin} />}
        />

        {/* User Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuth={isAuth} loading={loading}>
              {role === "admin" ? 
                <Navigate to="/admin" replace /> : 
                <UserDashboard onLogout={handleLogout} />
              }
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute isAuth={isAuth} loading={loading}>
              {role === "admin" ? 
                <AdminDashboard onLogout={handleLogout} /> : 
                <Navigate to="/dashboard" replace />
              }
            </ProtectedRoute>
          }
        />

        {/* Protected User Routes */}
        <Route
          path="/my-reports"
          element={
            <ProtectedRoute isAuth={isAuth} loading={loading}>
              <MyReports onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report"
          element={
            <ProtectedRoute isAuth={isAuth} loading={loading}>
              <ReportIssue onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/community"
          element={
            <ProtectedRoute isAuth={isAuth} loading={loading}>
              <CommunityPage onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute isAuth={isAuth} loading={loading}>
              <UserProfile onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Admin Only Routes */}
        <Route
          path="/admin/manage-issues"
          element={
            <ProtectedRoute isAuth={isAuth} loading={loading}>
              {role === "admin" ? 
                <ManageIssues onLogout={handleLogout} /> : 
                <Navigate to="/dashboard" replace />
              }
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/map"
          element={
            <ProtectedRoute isAuth={isAuth} loading={loading}>
              {role === "admin" ? 
                <AdminMapLeaflet onLogout={handleLogout} /> : 
                <Navigate to="/dashboard" replace />
              }
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute isAuth={isAuth} loading={loading}>
              {role === "admin" ? 
                <ManageDepartments onLogout={handleLogout} /> : 
                <Navigate to="/dashboard" replace />
              }
            </ProtectedRoute>
          }
        />

        {/* Individual Report View */}
        <Route
          path="/report/:id"
          element={
            <ProtectedRoute isAuth={isAuth} loading={loading}>
              <ReportIssue />
            </ProtectedRoute>
          }
        />

        {/* User Settings Route */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute isAuth={isAuth} loading={loading}>
              {role === "admin" ? 
                <Navigate to="/admin/settings" replace /> : 
                <UserSettings onLogout={handleLogout} />
              }
            </ProtectedRoute>
          }
        />
        
        {/* Admin Settings Route */}
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute isAuth={isAuth} loading={loading}>
              {role === "admin" ? 
                <AdminSettings onLogout={handleLogout} /> : 
                <Navigate to="/settings" replace />
              }
            </ProtectedRoute>
          }
        />

        {/* Legacy Route Redirects */}
        <Route path="/UserProfile" element={<Navigate to="/profile" replace />} />
        <Route path="/manage-issues" element={<Navigate to="/admin/manage-issues" replace />} />
        
        {/* Catch-All Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </ErrorBoundary>
  );
}