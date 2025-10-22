// FILE: client/src/routes/ProtectedRoute.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'


// requiredRole: 'admin' | 'faculty' | 'student' | undefined (any logged in user)
export default function ProtectedRoute({ children, requiredRole }) {
const { user } = useAuth()
if (!user) return <Navigate to="/login" replace />
if (requiredRole && user.role !== requiredRole) {
// simple fallback: send to user's own dashboard
return <Navigate to={`/${user.role}`} replace />
}
return children
}