# Project: University Examination Management System (UEMS)

## Context: Re-engineering of JNTUH SIS Portal

---

## 1. Project Overview

* **Objective:** Design and implement a secure, scalable, and user-friendly University Examination Management System by improving the existing JNTUH Student Information System (SIS).
* **Primary Goal:** Centralize academic operations such as authentication, attendance, examinations, and result processing with strict data privacy.
* **Current Status:** ~20% completed

  * Authentication system implemented (JWT-based login)
  * Role-based dashboards (Admin, Faculty, Student)
  * Faculty course fetching from database
  * Basic attendance UI created (not fully integrated with backend yet)

---

## 2. Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Axios (centralized via `axiosInstance.js`)
* Context API (`AuthContext`) for authentication state

### Backend

* Spring Boot (Java 17)
* Spring Security with JWT Authentication
* Spring Data JPA (Hibernate)

### Database

* PostgreSQL (hosted on Neon cloud platform)
* Auto schema generation using Hibernate (`ddl-auto=update`)

### Architecture

* Fully decoupled client-server architecture:

  * `/client` → React frontend
  * `/server` → Spring Boot backend
* RESTful APIs used for communication

---

## 3. System Roles & Responsibilities

### Admin

* Manage users (Students & Faculty)
* Add users manually
* Bulk upload users via Excel/CSV
* View system-wide analytics and reports
* Control courses, exams, and schedules

### Faculty

* View assigned courses
* Enter attendance
* Upload marks/results
* View class-level analytics

### Student

* View personal attendance
* View results and transcripts
* Pay supplementary exam fees
* Access notifications

---

## 4. Core Business Rules

### 🔐 Security (CRITICAL)

* Students must ONLY access their own data (attendance, marks, transcripts)
* No public result links
* All APIs must be protected using JWT authentication
* Role-based access control must be strictly enforced

### 👤 User System Design

* `User` is the base authentication entity

* Each User has:

  * username
  * email
  * password (encrypted)
  * role (ROLE_ADMIN, ROLE_FACULTY, ROLE_STUDENT)

* Relationships:

  * One-to-One: User → Student
  * One-to-One: User → Faculty

---

## 5. Authentication Flow

* Login via email/username + password
* JWT token generated on successful login
* Token stored in frontend (sessionStorage)
* Sent with every API request via Axios interceptor
* Role-based redirection:

  * Admin → `/admin`
  * Faculty → `/faculty`
  * Student → `/student`

---

## 6. Current Backend Structure

Base Package: `com.uems.server`

* controller/ → REST controllers
* service/ → Business logic
* repository/ → JPA repositories
* model/ → Entities (User, Role, Student, Faculty, Course, Attendance)
* payload/ → DTOs for requests/responses
* security/ → JWT, filters, authentication logic
* config/ → DataLoader, CORS config
* util/ → Constants (RoleConstants)

---

## 7. Key Features to Implement Next

### 1. Admin User Management (HIGH PRIORITY)

* Admin can:

  * Add students/faculty manually
  * Upload Excel file for bulk user creation
* System should:

  * Auto-generate passwords
  * Encrypt passwords using PasswordEncoder
  * Assign roles correctly
* Only Admin should access these APIs

---

### 2. Attendance System (FIX REQUIRED)

* Faculty can mark attendance
* Data must:

  * Be saved in database
  * Reflect immediately in student dashboard
* Ensure correct entity relationships and API integration

---

### 3. Examination & Results Module

* Faculty uploads marks (manual or Excel)
* System processes results
* Students can view only their results

#### Special Logic:

* Supplementary fee payment:

  * Show ONLY failed subjects

---

### 4. Analytics & Visualization

* Admin & Faculty dashboards:

  * Attendance statistics
  * Marks distribution
* Use charts (frontend)

---

### 5. Transcript Generation

* Calculate:

  * SGPA per semester
  * CGPA overall
* Display structured transcript for students

---

## 8. Admin Workflow (IMPORTANT)

* Default Admin is created via DataLoader
* No public registration system

Flow:

1. Admin logs in
2. Admin creates Students/Faculty
3. System generates credentials
4. (Future) Credentials sent via email
5. User logs in and can change password

---

## 9. Coding Standards for AI Agents

### General

* Follow layered architecture:
  Controller → Service → Repository
* Use clean, readable code
* Avoid hardcoding values

### Naming Conventions

* Java: camelCase
* Classes: PascalCase
* Database: snake_case

### Security

* Always enforce role-based access:

  * Use Spring Security configuration
  * Prefer `@PreAuthorize` where applicable

### Backend

* Use DTOs instead of exposing entities directly
* Validate inputs properly
* Handle exceptions using global exception handling (if available)

### Frontend

* Use `axiosInstance` for all API calls (JWT already configured)
* Use `AuthContext` for authentication state
* Protect routes using `ProtectedRoute`

---

## 10. Future Enhancements (Optional but Recommended)

* Email service for sending credentials
* Password reset via email
* File storage optimization for transcripts
* Audit logs (who updated what)
* Role-based dashboards with real-time updates

---

## 11. Notes for AI Code Generation

* Ensure compatibility with existing structure
* Do NOT duplicate entities
* Use existing repositories and services
* Maintain consistent role naming:

  * ROLE_ADMIN
  * ROLE_FACULTY
  * ROLE_STUDENT
* Ensure Neon PostgreSQL compatibility (SSL enabled)
