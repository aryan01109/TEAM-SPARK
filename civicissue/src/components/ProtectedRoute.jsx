// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, isAuth, loading }) {
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="loading-spinner">
        Checking authentication...
      </div>
    );
  }

  // Redirect to login page if not authenticated
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content if authenticated
  return children;
}
