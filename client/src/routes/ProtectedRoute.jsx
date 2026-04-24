// FILE: client/src/routes/ProtectedRoute.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();

  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
}
