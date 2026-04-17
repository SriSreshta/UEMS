// FILE: client/src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./dashboards/AdminDashboard";
import FacultyDashboard from "./dashboards/FacultyDashboard";
import StudentDashboard from "./dashboards/StudentDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import FacultyAttendancePage from "./pages/FacultyAttendancePage";
import MarkAttendancePage from "./pages/MarkAttendancePage";
import StudentAttendancePage from "./pages/StudentAttendancePage";
import UploadMarksPage from "./pages/UploadMarksPage";
import StudentMarksPage from "./pages/StudentMarksPage";
import AdminFeeNotifications from "./pages/AdminFeeNotifications";
import StudentPaymentsPage from "./pages/StudentPaymentsPage";
import StudentExamSchedule from "./pages/StudentExamSchedule";
import StudentResults from "./pages/StudentResults";
import StudentDocumentStore from "./pages/StudentDocumentStore";
import VerifyMemoPage from "./pages/VerifyMemoPage";

import AddUserManual from "./pages/AddUserManual";
import BulkUserUpload from "./pages/BulkUserUpload";
import ManageCourses from "./pages/ManageCourses";
import CourseEnrollment from "./pages/CourseEnrollment";
import ManageUsers from "./pages/ManageUsers";
import FacultyMaterialsPage from "./pages/FacultyMaterialsPage";
import StudentMaterialsPage from "./pages/StudentMaterialsPage";
import FacultyMarksViewPage from "./pages/FacultyMarksViewPage";
import AdminCreateExam from "./pages/AdminCreateExam";
import AdminExamSchedules from "./pages/AdminExamSchedules";
import AdminPublishResults from "./pages/AdminPublishResults";
import Footer from "./components/Footer";
import YearSemAnalytics from "./pages/analytics/YearSemAnalytics";
import DeptAnalytics from "./pages/analytics/DeptAnalytics";
import Chatbot from "./components/Chatbot";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Global Chatbot Widget — visible on all pages when logged in */}
      <Chatbot />
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

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

        <Route
          path="/faculty/marks/upload/:courseId"
          element={
            <ProtectedRoute requiredRole="faculty">
              <UploadMarksPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty/materials"
          element={
            <ProtectedRoute requiredRole="faculty">
              <FacultyMaterialsPage />
            </ProtectedRoute>
          }
        />

        {/* Faculty Marks Sidebar Pages */}
        <Route
          path="/faculty/internal/mid1"
          element={
            <ProtectedRoute requiredRole="faculty">
              <FacultyMarksViewPage markType="mid1" title="Mid Term 1" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/internal/mid2"
          element={
            <ProtectedRoute requiredRole="faculty">
              <FacultyMarksViewPage markType="mid2" title="Mid Term 2" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/internal/assignment"
          element={
            <ProtectedRoute requiredRole="faculty">
              <FacultyMarksViewPage markType="assignment" title="Assignment / Seminar" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/external/endsem-theory"
          element={
            <ProtectedRoute requiredRole="faculty">
              <FacultyMarksViewPage markType="endSem" title="End Sem" />
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
          path="/admin/fees"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminFeeNotifications />
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
          path="/admin/users/manage"
          element={
            <ProtectedRoute requiredRole="admin">
              <ManageUsers />
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

        <Route
          path="/admin/manage-courses"
          element={
            <ProtectedRoute requiredRole="admin">
              <ManageCourses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/enrollments"
          element={
            <ProtectedRoute requiredRole="admin">
              <CourseEnrollment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/exams/create"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminCreateExam />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/exams/schedules"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminExamSchedules />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/exams/results"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPublishResults />
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

        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentAttendancePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/marks/internal"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentMarksPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/payments"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentPaymentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/materials"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentMaterialsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/exam-schedule"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentExamSchedule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/results"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentResults />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/documents"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDocumentStore type="document" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/certificates"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDocumentStore type="certificate" />
            </ProtectedRoute>
          }
        />

        <Route 
        path="/admin/analytics/year-sem" 
        element={
        <YearSemAnalytics />
        } 
        />
        <Route 
        path="/admin/analytics/dept"     
        element={<DeptAnalytics />
        } 
        />

        {/* Public Validation Route */}
        <Route path="/verify-memo" element={<VerifyMemoPage />} />

        {/* 404 fallback */}
        <Route path="*" element={<div className="p-8">404 — Not Found</div>} />
      </Routes>
    </div>
  );
}
