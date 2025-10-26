// FILE: client/src/routes/ProtectedRoute.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();

  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  // Map backend role to lowercase role string for easier comparison
  const roleMap = {
    'ROLE_ADMIN': 'admin',
    'ROLE_FACULTY': 'faculty',
    'ROLE_STUDENT': 'student'
  };
  const userRole = roleMap[user.role];

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={`/${userRole}`} replace />;
  }

  return children;
}
