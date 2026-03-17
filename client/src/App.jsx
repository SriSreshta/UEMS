// FILE: client/src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./dashboards/AdminDashboard";
import FacultyDashboard from "./dashboards/FacultyDashboard";
import StudentDashboard from "./dashboards/StudentDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import FacultyAttendancePage from "./pages/FacultyAttendancePage";
import MarkAttendancePage from "./pages/MarkAttendancePage";

import AddUserManual from "./pages/AddUserManual";
import BulkUserUpload from "./pages/BulkUserUpload";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Faculty routes */}
        <Route
          path="/faculty"
          element={
            <ProtectedRoute requiredRole="faculty">
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty/attendance"
          element={
            <ProtectedRoute requiredRole="faculty">
              <FacultyAttendancePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty/attendance/mark/:courseId"
          element={
            <ProtectedRoute requiredRole="faculty">
              <MarkAttendancePage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/users/add"
          element={
            <ProtectedRoute requiredRole="admin">
              <AddUserManual />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/users/upload"
          element={
            <ProtectedRoute requiredRole="admin">
              <BulkUserUpload />
            </ProtectedRoute>
          }
        />

        {/* Student routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 fallback */}
        <Route path="*" element={<div className="p-8">404 — Not Found</div>} />
      </Routes>
    </div>
  );
}
