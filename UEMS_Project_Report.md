# UNIVERSITY EXAMINATION MANAGEMENT SYSTEM (UEMS)
### A Full-Stack Web Application for Academic Administration

---

> **Project Title:** University Examination Management System (UEMS)  
> **Technology Stack:** React 18 · Spring Boot 3 · PostgreSQL · JWT · Google Gemini AI  
> **Academic Year:** 2025–2026  

---

## TABLE OF CONTENTS

1. Abstract
2. Introduction
3. Objectives
4. System Scope
5. Problem Definition
6. Methodology
7. Tools & Technologies
8. System Architecture
9. User Roles & Modules
10. Database Design
11. Implementation
12. Results & Evaluation
13. Future Scope
14. Conclusion
15. References

---

## ABSTRACT

The University Examination Management System (UEMS) is a comprehensive, role-based web platform engineered to digitize and streamline every critical academic operation within a university — from student enrollment and attendance monitoring to internal marks management, examination scheduling, result publication, fee processing, and document storage.

Universities across the globe continue to grapple with fragmented administrative tools: attendance tracked on paper registers, marks entered in spreadsheets, results published via notice boards, and fee dues communicated through informal channels. These disconnected workflows breed data inconsistencies, delayed communication, and a tangible sense of frustration for students, faculty, and administrators alike.

UEMS reimagines this landscape. Built on a **React + Vite** frontend communicating with a **Spring Boot** REST API backed by **PostgreSQL**, the system enforces role-based access control (RBAC) through **JWT authentication**, ensuring that every interaction is secure, contextual, and relevant to the user's identity. Three distinct portals — **Admin**, **Faculty**, and **Student** — each present a curated interface tailored to the demands of that role.

The platform extends beyond conventional ERP functionality with an embedded **AI-powered chatbot** (Google Gemini) capable of contextual academic assistance, an **automated email notification** engine for low-attendance alerts and password resets, and a **dynamic supplementary fee calculator** for students who fail subjects.

UEMS is not just a management tool — it is a digital campus companion. It transforms reactive, paper-driven administration into a proactive, data-centric, real-time academic ecosystem.

---

## 1. INTRODUCTION

### 1.1 Introduction

The exponential growth of student enrollment in higher education institutions has created a proportional demand for efficient, scalable academic management tools. Modern universities serve thousands of students across multiple departments, years, and semesters — each requiring personalized academic tracking, examination management, fee oversight, and results access.

Traditional university management relies heavily on manual processes: invigilators marking attendance on printed sheets, faculty entering marks into Excel files, administrators computing grades by hand, and students queuing at counters for fee receipts or result printouts. This approach is not only time-consuming but fundamentally error-prone.

The **University Examination Management System (UEMS)** was conceived to bridge this gap — to transform a university's administrative backbone into an intelligent, always-available, digital platform. UEMS centralizes everything: student profiles, course assignments, attendance records, internal marks, examination schedules, published results, fee notifications, study materials, and institutional documents — all accessible through a secure, intuitive web interface.

What makes UEMS unique is its **three-dimensional role architecture**. An administrator wields full operational authority — creating users, defining courses, scheduling exams, and publishing results. A faculty member is empowered to teach and evaluate — marking attendance, uploading marks, and sharing course materials. A student is given visibility and agency — checking attendance percentages, viewing marks in real-time, downloading materials, and paying fees online.

The system's intelligence layer is powered by **Google Gemini AI**, embedded as a chatbot widget available on every page, offering contextual academic guidance. On the infrastructure side, **automated email alerts** notify students the moment their overall attendance dips below the mandatory 75% threshold — a proactive safety net that prevents academic penalties.

UEMS is production-grade software. It uses **JWT-based stateless authentication**, **BCrypt password hashing**, **HikariCP connection pooling**, **Spring Security's method-level authorization**, and a carefully optimized PostgreSQL schema to handle real-world institutional loads.

---

### 1.2 Problem Statement

Despite rapid digitization across industries, university academic administration remains largely fragmented. The following specific problems motivated the development of UEMS:

1. **Attendance Chaos:** Faculty manually record attendance per class, often on paper. Compiling semester-wise attendance percentages is a time-consuming, error-prone exercise done close to exam time — too late for students to recover.

2. **Marks Mismanagement:** Internal marks for Mid-Term 1, Mid-Term 2, Assignments, and End-Semester examinations are stored in different files by different faculty members. There is no unified repository, making result computation a complex manual undertaking.

3. **Opaque Result Publication:** Before results are officially published, students have no visibility into their performance. Once published, physical notice boards are the primary medium — inaccessible to remote students.

4. **Unstructured Fee Management:** Fee notifications are distributed through emails or notice boards with no formal acknowledgement or payment tracking mechanism. Students miss deadlines unknowingly.

5. **Document Fragmentation:** Students store certificates, transcripts, and other documents in personal folders with no institutional backup or access mechanism.

6. **No Holistic Analytics:** Administrators have no real-time, data-driven view of pass/fail rates, department performance, or semester-wise academic trends.

7. **Absent AI Assistance:** Students and faculty lack a contextual assistant for academic queries — course information, attendance policies, examination schedules — forcing them to navigate multiple portals or wait for office hours.

UEMS addresses each of these problems with a targeted, purpose-built module backed by a unified database.

---

## 2. LITERATURE SURVEY

### 2.1 Motivation

The motivation for building UEMS stems from a direct observation of inefficiencies in existing academic workflows across Indian universities. Key motivators include:

- **Regulatory Compliance:** University Grants Commission (UGC) mandates minimum 75% attendance for examination eligibility. Without real-time tracking and proactive notification, students frequently violate this requirement unknowingly — suffering academic consequences that could have been prevented.

- **Examination Integrity:** Manual marks entry across multiple stages (internal evaluations, end-semester examinations) introduces rounding errors, human oversight, and data loss. A centralized marks repository with controlled access eliminates these risks.

- **Student Empowerment:** Modern students expect on-demand access to academic data. Learning Management Systems (LMS) like Moodle and Blackboard have demonstrated that digital platforms improve student engagement and academic outcomes.

- **Administrative Efficiency:** Studies in higher-education administration show that digitizing routine tasks — attendance, marks entry, result publication — can reduce administrative workload by up to 60%, freeing staff for higher-value activities.

- **AI Integration in Education:** Large Language Models (LLMs) like Google Gemini have shown enormous promise in educational contexts. A contextually aware chatbot embedded within an academic management platform can serve as a 24/7 advisor, reducing support load on academic staff.

- **Scalability Imperative:** As institutions grow, paper-based systems do not scale. UEMS's microservice-ready architecture and stateless API design ensure the platform grows with the institution.

---

### 2.2 Objectives

The primary objectives of the UEMS project are:

1. **Centralize Academic Data** — Consolidate student profiles, course data, marks, attendance, and results in a single, secure PostgreSQL database.

2. **Implement Robust RBAC** — Enforce role-specific access through JWT authentication and Spring Security, ensuring data is accessible only to authorized roles.

3. **Automate Routine Notifications** — Trigger real-time email alerts for low attendance, password resets, and fee deadlines via Gmail SMTP integration.

4. **Enable Granular Analytics** — Provide administrators with year/semester and department-wise grade distribution charts to support data-driven academic policy decisions.

5. **Integrate AI Assistance** — Embed a Google Gemini-powered chatbot for contextual academic query resolution, available across all portal pages.

6. **Streamline Examination Lifecycle** — Cover every stage: exam creation, timetable scheduling, marks upload, result computation, grade assignment, and result publication.

7. **Support Supplementary Examination Management** — Dynamically compute supplementary examination fees based on the number of failed subjects selected by the student.

8. **Digitize Document Management** — Provide students with a secure personal document vault for certificates, transcripts, and institutional documents.

---

### 2.3 Applications

UEMS has broad applicability across different institutional contexts:

| Application Domain | Description |
|---|---|
| **Degree Colleges** | Manage attendance, marks, and results for all UG/PG programs |
| **Engineering Institutions** | Handle department-wise course enrollment and end-semester examinations |
| **Autonomous Universities** | Full lifecycle from course creation to result publication and grading |
| **Distance/Hybrid Learning** | Online attendance tracking and material distribution |
| **Examination Boards** | Centralized result notification and analytics for multiple affiliated colleges |
| **Administrative Offices** | Fee management, user provisioning, and bulk data import |

---

## 3. SYSTEM ANALYSIS

### 3.1 Existing System

Currently, most universities employ one or more of the following approaches to academic management:

**Manual Paper-Based Systems:**
- Attendance registers maintained by faculty per class session
- Marks submitted via printed mark-sheets to department offices
- Results displayed on physical notice boards or mailed to students
- Fee notifications distributed via circular letters or email blasts

**Partially Digital Systems:**
- Attendance entered into Excel spreadsheets at the end of the month
- Marks computed in faculty-maintained Excel workbooks
- Generic email clients used for fee notifications without tracking
- Google Drive or USB drives used for study material distribution

**Disconnected ERP Modules:**
- University ERPs (EduTech, Fedena) that handle only one dimension (e.g., fee management) without integration across attendance, marks, and results
- Systems that require expensive licensing and complex deployment, making them inaccessible to smaller institutions

**Key Weaknesses of Existing Systems:**
- No real-time visibility — students discover attendance shortfall days before exams
- No unified marks repository — result computation is a manual, error-prone process
- No automated alerts — students miss deadlines, faculty miss pending uploads
- No analytics layer — administrators cannot identify failing departments or subjects proactively
- No AI assistance — students must navigate multiple URLs or visit physical offices for information

---

### 3.2 Proposed System

UEMS proposes a **unified, role-aware, real-time digital platform** that:

- **Centralizes** all academic data in a normalized PostgreSQL schema
- **Enforces security** at every layer via JWT tokens and Spring Security's `@PreAuthorize`
- **Notifies proactively** via email when attendance drops below 75%, when fees are due, or when passwords are reset
- **Empowers analytics** with live charts showing grade distributions by department, year, and semester
- **Assists intelligently** via an embedded Gemini AI chatbot across all pages
- **Manages the full examination lifecycle** — from exam creation to grade publication with a controlled `endSemReleased` flag
- **Handles supplementary examinations** dynamically — students select failed subjects, the system computes the supply fee accordingly
- **Provides document storage** for student certificates and institutional documents

The system's architecture is designed for **stateless scalability** — meaning the API layer can be horizontally scaled without session management concerns.

---

### 3.3 Advantages of Proposed System

| Dimension | Advantage |
|---|---|
| **Speed** | Attendance marked and visible in real-time; marks updated instantly upon faculty upload |
| **Accuracy** | Grade computation (O/A+/A/B+/B/C/F/Ab) automated based on standardized mark ranges |
| **Security** | JWT expiry (30 min), BCrypt hashing, role-gated endpoints, CORS configuration |
| **Accessibility** | 24/7 availability from any device — no physical visits required |
| **Proactivity** | Automated email alerts before crises escalate (attendance, fee deadlines) |
| **Analytics** | Real-time visual analytics for informed academic governance |
| **Scalability** | Stateless API design; HikariCP connection pooling for concurrent load handling |
| **AI-Powered** | Gemini AI chatbot for contextual assistance without administrative overhead |
| **Bulk Operations** | CSV/Excel bulk user import and batch enrollment saves hours of manual entry |
| **Auditability** | Every enrollment, mark, attendance record, and payment timestamped and persisted |

---

## 4. SYSTEM REQUIREMENTS

### 4.1 Functional Requirements

**Authentication Module:**
- FR-01: The system shall allow users to log in using role-specific credentials (Admin: username+password; Faculty: username+faculty code+password; Student: username+roll number+password)
- FR-02: The system shall issue a JWT token upon successful login, valid for 30 minutes
- FR-03: The system shall support password reset via a time-limited (15-minute) email token

**User Management Module:**
- FR-04: Admin shall be able to create individual users (Student/Faculty) with profile data
- FR-05: Admin shall be able to bulk-import users via Excel/CSV file upload
- FR-06: Admin shall be able to edit student academic details (year, semester, department, name, email)
- FR-07: Admin shall be able to delete user accounts

**Course Management Module:**
- FR-08: Admin shall be able to create, edit, and delete courses with department, year, semester metadata
- FR-09: Admin shall be able to assign faculty members to courses
- FR-10: Admin shall be able to enroll individual or bulk students into courses
- FR-11: Admin shall be able to perform batch enrollment for an entire year/semester cohort

**Attendance Module:**
- FR-12: Faculty shall mark attendance (Present/Absent) for all enrolled students per course per date
- FR-13: Faculty shall be able to update previously marked attendance for the same date
- FR-14: Students shall view subject-wise attendance percentages for their current semester
- FR-15: The system shall automatically send a warning email when student attendance falls below 75%

**Marks & Results Module:**
- FR-16: Faculty shall upload marks for Mid-Term 1, Mid-Term 2, Assignment, and End-Semester evaluations
- FR-17: Admin shall publish results with an `endSemReleased` flag, controlling student visibility
- FR-18: The system shall auto-compute grades (O/A+/A/B+/B/C/F/Ab) and grade points upon release
- FR-19: Students shall view internal marks, final grades, CGPA, and semester-wise result history

**Examination Module:**
- FR-20: Admin shall create, schedule, and manage examinations
- FR-21: Students shall view their personalized exam timetable
- FR-22: The system shall manage supplementary examination registrations for failed subjects

**Fee Management Module:**
- FR-23: Admin shall post fee notifications with type, amount, and due date
- FR-24: Students shall view active fee notifications and mark them as paid
- FR-25: The system shall dynamically compute supplementary exam fees based on selected failed subjects

**Materials & Documents Module:**
- FR-26: Faculty shall upload study materials linked to specific courses
- FR-27: Students shall download materials for their enrolled courses
- FR-28: Students shall upload and retrieve personal documents (certificates, transcripts)

**Analytics Module:**
- FR-29: Admin shall view grade distribution analytics filterable by year, semester, and department
- FR-30: Admin shall view department-wise pass percentage overview

**AI Chatbot Module:**
- FR-31: All authenticated users shall have access to a Gemini AI chatbot widget on every page

---

### 4.2 Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | API responses under 500ms for standard queries; database queries optimized with lazy loading |
| **Security** | JWT authentication on all protected endpoints; BCrypt (strength 10) for all passwords; CORS restricted to known origins |
| **Scalability** | Stateless REST API enabling horizontal scaling; HikariCP pool (max 5, min idle 2) for database concurrency |
| **Reliability** | Graceful server shutdown; 20s drain period for in-flight requests; auto-sync admin password from .env on every startup |
| **Usability** | Role-specific dashboards with contextual navigation; responsive layout across desktop and tablet viewports |
| **Maintainability** | Layered architecture (Controller → Service → Repository); DTO pattern preventing entity leakage; Lombok-generated boilerplate |
| **Data Integrity** | Unique constraints on enrollment (student+course), cascading deletes, nullable=false on critical foreign keys |
| **Compliance** | Password reset token expires in 15 minutes; JWT token expires in 30 minutes; sensitive config via environment variables |

---

### 4.3 Hardware Requirements

**Development Environment:**
- Processor: Intel Core i5 (8th Gen) or equivalent / AMD Ryzen 5 or higher
- RAM: Minimum 8 GB (16 GB recommended for running both servers concurrently)
- Storage: Minimum 20 GB free disk space
- Network: Stable broadband connection (for Gemini AI API and Gmail SMTP)

**Production Deployment (Recommended):**
- Server: 2 vCPUs, 4 GB RAM minimum (cloud VM: AWS EC2 t3.medium or equivalent)
- Database Server: PostgreSQL on dedicated instance or managed service (RDS, Supabase)
- Storage: 50 GB SSD for application data and uploaded files

---

### 4.4 Software Requirements

| Component | Technology | Version |
|---|---|---|
| **Frontend Runtime** | Node.js | 18+ |
| **Frontend Framework** | React | 18.x |
| **Frontend Build Tool** | Vite | 5.x |
| **HTTP Client** | Axios | 1.x |
| **Icon Library** | Heroicons | 2.x |
| **Backend Framework** | Spring Boot | 3.x |
| **Backend Language** | Java | 17+ |
| **Build Tool (Server)** | Maven | 3.9+ |
| **ORM** | Hibernate (Spring Data JPA) | 6.x |
| **Database** | PostgreSQL | 15+ |
| **Security** | Spring Security + JJWT | 0.11+ |
| **Email** | Spring Mail + Gmail SMTP | — |
| **AI Integration** | Google Gemini API | 1.5 Flash |
| **Code Simplification** | Lombok | 1.18+ |
| **Operating System** | Windows 10/11, Ubuntu 22.04 | — |
| **Browser** | Chrome 120+, Firefox 120+, Edge 120+ | — |

---

## 5. SYSTEM DESIGN

### 5.1 Use Case Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          UEMS System Boundary                           │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      <<Authentication>>                          │   │
│  │   Login  ──── Forgot Password ──── Reset Password                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ ADMIN                                                             │  │
│  │  • Create / Edit / Delete Users                                   │  │
│  │  • Bulk Upload Users (Excel)                                      │  │
│  │  • Manage Courses (CRUD)                                          │  │
│  │  • Assign Faculty to Course                                       │  │
│  │  • Enroll Students (Single / Bulk / Batch)                        │  │
│  │  • Post Fee Notifications                                         │  │
│  │  • Create Exam & Schedule                                         │  │
│  │  • Publish Exam Results                                           │  │
│  │  • View Year/Sem Analytics                                        │  │
│  │  • View Department Analytics                                      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ FACULTY                                                           │  │
│  │  • View Assigned Courses                                          │  │
│  │  • Mark / Update Attendance per Course per Date                   │  │
│  │  • Upload Mid1 / Mid2 / Assignment / EndSem Marks                 │  │
│  │  • Upload Study Materials                                         │  │
│  │  • View Marks per Course                                          │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ STUDENT                                                           │  │
│  │  • View Subject-wise Attendance %                                 │  │
│  │  • View Internal Marks                                            │  │
│  │  • View Exam Schedule                                             │  │
│  │  • View Published Results + CGPA                                  │  │
│  │  • Pay / View Fees                                                │  │
│  │  • Select Supply Subjects & Compute Fee                           │  │
│  │  • Download Study Materials                                       │  │
│  │  • Store / Retrieve Personal Documents                            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  <<All Roles>> ─── AI Chatbot (Gemini)                                  │
└─────────────────────────────────────────────────────────────────────────┘
     │                   │                      │
  [Admin]            [Faculty]              [Student]
```

---

### 5.2 Sequence Diagram

**Scenario: Student Login & Attendance Fetch**

```
Browser            React App         AuthContext        AxiosInstance      JwtAuthFilter    AttendanceController    AttendanceService      DB
  │                    │                  │                  │                  │                   │                      │               │
  │──Navigate /login──>│                  │                  │                  │                   │                      │               │
  │                    │──POST /auth/login─────────────────>│                  │                   │                      │               │
  │                    │                  │                  │──permitAll──────>│                   │                      │               │
  │                    │                  │                  │                  │──AuthService.login()──────────────────>  │               │
  │                    │                  │                  │                  │                   │                      │──SELECT user──>│
  │                    │                  │                  │                  │                   │                      │<──User entity─│
  │                    │                  │                  │                  │                   │──BCrypt.verify()─────│               │
  │                    │                  │                  │                  │                   │──JwtService.generateToken()          │
  │                    │                  │                  │<──200 {token, role, studentId}───────│                      │               │
  │                    │<──store in AuthContext────────────<│                  │                   │                      │               │
  │<──Redirect /student│                  │                  │                  │                   │                      │               │
  │                    │                  │                  │                  │                   │                      │               │
  │──/student/attendance────────────────>│                  │                  │                   │                      │               │
  │                    │─GET /attendance/student/{id}/stats─────────────────>│                  │                      │               │
  │                    │                  │                  │──Bearer token───>│                   │                      │               │
  │                    │                  │                  │                  │──validate JWT     │                      │               │
  │                    │                  │                  │                  │──set SecurityContext                     │               │
  │                    │                  │                  │                  │──route────────────>│                      │               │
  │                    │                  │                  │                  │                   │──getStudentAttendanceStats()──────>│
  │                    │                  │                  │                  │                   │                      │──SELECT─────>│
  │                    │                  │                  │                  │                   │                      │<──records───│
  │                    │                  │                  │                  │                   │<──List<AttendanceDTO>│               │
  │                    │<──200 JSON Array──────────────────────────────────<│                   │                      │               │
  │<──Render table─────│                  │                  │                  │                   │                      │               │
```

---

### 5.3 Activity Diagram

**Attendance Marking — Faculty Workflow:**

```
[START]
   │
   ▼
Faculty logs in → JWT issued → Redirect /faculty
   │
   ▼
Navigate to Attendance → FacultyAttendancePage loads
   │
   ▼
System fetches assigned courses → GET /api/courses/faculty/by-username/{username}
   │
   ▼
Faculty selects course → Navigate /faculty/attendance/mark/:courseId
   │
   ▼
MarkAttendancePage: fetch enrolled students → GET /api/attendance/students/{courseId}
   │
   ▼
Faculty picks a date (date picker)
   │
   ▼
System checks: Was attendance already marked for this date?
   ├── YES → Load existing records (update mode)
   └── NO  → Show fresh student list (mark mode)
   │
   ▼
Faculty marks Present/Absent for each student
   │
   ▼
Faculty submits → POST /api/attendance/bulk
   │
   ▼
AttendanceService.markAttendanceBulk()
   │
   ├── Verify faculty is assigned to course
   ├── Upsert attendance records (create or update)
   └── For each affected student:
         └── Compute overall attendance %
               ├── IF < 75% → sendAttendanceWarningEmail()
               └── IF ≥ 75% → No action
   │
   ▼
200 OK → Success toast shown
   │
[END]
```

**Result Publication — Admin Workflow:**

```
[START]
   │
   ▼
Admin navigates /admin/exams/results → AdminPublishResults page
   │
   ▼
Admin selects Year + Semester + Department → Fetch student list
   │
   ▼
Admin previews marks for each student (Mid1, Mid2, Assignment, EndSem)
   │
   ▼
Admin reviews grades (auto-computed: O/A+/A/B+/B/C/F/Ab)
   │
   ▼
Admin clicks "Publish Results" → PUT /api/admin/exams/publish
   │
   ▼
AdminService sets endSemReleased = true for all matching enrollments
   │
   ▼
Students can now access results at /student/results
   │
   ▼
Student views: grade, grade points, total marks, pass/fail, CGPA
   │
   ├── IF any subject FAILED:
   │     └── Supply fee options become visible
   │           └── Student selects subjects → dynamic fee computed
   └── IF all passed:
         └── Clean result summary shown
   │
[END]
```

---

### 5.4 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│  React 18 + Vite (port 5173)                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Admin       │  │  Faculty     │  │  Student     │              │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  ┌────────────────────────────────────────────────┐                │
│  │  AuthContext (JWT + Role State)                │                │
│  │  axiosInstance (Bearer Token Interceptor)      │                │
│  └────────────────────────────────────────────────┘                │
│  ┌────────────────────────────────────────────────┐                │
│  │  Chatbot (Gemini AI) — Global Widget           │                │
│  └────────────────────────────────────────────────┘                │
└───────────────────────────┬─────────────────────────────────────────┘
                            │  HTTP REST + JWT Bearer Token
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYER                                 │
│  Spring Security | CORS | JwtAuthenticationFilter | STATELESS       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Public: /api/auth/**, /uploads/**, /api/courses/faculty/**  │   │
│  │  Role-gated: /api/faculty/** → ROLE_FACULTY                  │   │
│  │  Authenticated: All others → any valid JWT                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API / CONTROLLER LAYER                         │
│  ┌──────────┐ ┌────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐  │
│  │AuthCtrl  │ │AdminCtl│ │FacultyCtl │ │StudentCtl│ │ChatCtrl  │  │
│  └──────────┘ └────────┘ └───────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌────────┐ ┌───────────┐ ┌──────────┐               │
│  │AttendCtl │ │ExamCtl │ │PaymentCtl │ │CourseCtl │               │
│  └──────────┘ └────────┘ └───────────┘ └──────────┘               │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                                  │
│  AdminService | AuthService | AttendanceService | CourseService     │
│  FacultyService | EmailService | AIService | ChatService            │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    REPOSITORY LAYER (Spring Data JPA)               │
│  UserRepo | StudentRepo | FacultyRepo | CourseRepo | EnrollmentRepo │
│  AttendanceRepo | ExamRepo | FeeNotifRepo | MaterialRepo | ...       │
└───────────────────────────┬─────────────────────────────────────────┘
                            │  HikariCP Connection Pool
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                            │
│  14 Tables: users, roles, students, faculty, courses, enrollments,  │
│  attendance, exams, exam_schedules, fee_notifications,              │
│  student_payments, materials, student_documents, result_notifs      │
└─────────────────────────────────────────────────────────────────────┘

External Integrations:
  ├── Google Gemini AI API  ←── ChatService.java (AIService.java)
  └── Gmail SMTP            ←── EmailService.java (Spring Mail)
```

---

## 6. WORKING DESCRIPTION

### 6.1 Overview

UEMS operates as a client-server application where the **React frontend** communicates exclusively through **REST API calls** to the **Spring Boot backend**. All communication is stateless — the server holds no session; every request carries a self-contained JWT token that the backend validates to establish the caller's identity and role.

The system's operational lifecycle flows as follows:

1. A user navigates to `http://localhost:5173` and is redirected to `/login`
2. After authentication, a JWT token is stored in `sessionStorage` under the key `uems_user`
3. Every subsequent API call made through `axiosInstance` automatically attaches this token as a `Bearer` header
4. The `JwtAuthenticationFilter` intercepts each request, validates the token, and sets the `SecurityContext`
5. Spring Security's `@PreAuthorize` annotations on controller methods enforce role-specific access
6. The service layer executes business logic, interacts with repositories, and returns DTOs (never raw entities)
7. The frontend renders the response in a role-appropriate UI component

---

### 6.2 Components and Workflow

**Frontend Components:**

| Component | Location | Responsibility |
|---|---|---|
| `AuthContext.jsx` | `src/auth/` | Global JWT + role state; provides `useAuth()` hook |
| `axiosInstance.js` | `src/api/` | Pre-configured Axios with JWT interceptor; base URL `http://localhost:8081/api` |
| `ProtectedRoute.jsx` | `src/routes/` | Guards routes; redirects to `/login` if unauthenticated or wrong role |
| `Sidebar.jsx` | `src/components/` | Role-aware navigation links based on current user's role |
| `Header.jsx` | `src/components/` | Top bar with page title, sidebar toggle, logout |
| `Chatbot.jsx` | `src/components/` | Floating AI chat widget; calls `/api/chat` endpoints |

**Backend Components:**

| Component | Package | Responsibility |
|---|---|---|
| `SecurityConfig.java` | `security/` | CORS, JWT filter chain, route permit rules, stateless session |
| `JwtAuthenticationFilter.java` | `security/` | Extracts + validates JWT on every request |
| `JwtService.java` | `security/` | HMAC-SHA256 token generation, claim extraction, expiry check |
| `DataLoader.java` | `config/` | Seeds roles + admin user; force-syncs admin password on every startup |
| `AdminService.java` | `service/` | Core business logic: user CRUD, enrollment, marks, analytics, bulk operations |
| `AttendanceService.java` | `service/` | Marks attendance, computes statistics, triggers low-attendance email |
| `AuthService.java` | `service/` | Role-specific login, password reset token flow |
| `EmailService.java` | `service/` | Gmail SMTP-based email dispatch (reset links, attendance warnings) |
| `AIService.java` | `service/` | Google Gemini API calls for chatbot responses |

---

### 6.3 Detailed Steps

**Step 1 — Application Startup:**
On every startup, `DataLoader.java` (implements `CommandLineRunner`) executes:
- Creates `ROLE_ADMIN`, `ROLE_FACULTY`, `ROLE_STUDENT` if they don't exist
- Force-syncs the admin password from `${ADMIN_PASSWORD}` environment variable
- Creates a default faculty and student user if the database has only the admin user

**Step 2 — Authentication Flow:**
The login page uses a **tabbed interface** — Admin, Faculty, Student — each requiring different credentials:
- **Admin:** username + password
- **Faculty:** username + faculty code + password
- **Student:** username + roll number + password

`AuthService.login()` validates each combination, generates a JWT using `JwtService.generateToken()`, and returns an `AuthResponse` containing the token, role, username, and profile ID (studentId or facultyId).

**Step 3 — Protected Navigation:**
`ProtectedRoute.jsx` checks `AuthContext` for a valid session. If absent, it redirects to `/login`. If present but with mismatched role (e.g., a faculty user trying to access `/admin`), it redirects to the appropriate dashboard.

**Step 4 — Course Enrollment (Admin):**
Admin selects Year + Semester + Department, filters students, selects a course, and uses bulk enrollment. The system uses a unique constraint `uk_enrollment_student_course` to prevent duplicate enrollments. The batch enrollment endpoint atomically clears and re-enrolls an entire cohort — useful for academic year transitions.

**Step 5 — Attendance Tracking:**
Faculty selects a course, picks a date, and marks each enrolled student as Present or Absent. The service layer:
1. Verifies faculty is assigned to the course
2. Upserts attendance records (idempotent — safe to re-submit)
3. Computes overall attendance percentage for each affected student
4. Sends email via `EmailService.sendAttendanceWarningEmail()` if below 75%

**Step 6 — Marks Upload & Result Publication:**
Faculty uploads marks for each evaluation type (Mid1, Mid2, Assignment, EndSem). Results remain invisible to students until Admin explicitly publishes them by setting `endSemReleased = true`. Upon publication, grades are auto-computed using the institutionally defined grading scale.

**Step 7 — Supplementary Examination:**
When a student views their results, failed subjects are highlighted. The student can select which failed subjects they wish to appear for in the supplementary examination. The system multiplies the per-subject fee by the number of selected subjects and presents the total dynamically — no page reload.

**Step 8 — AI Chatbot:**
The `Chatbot.jsx` component presents a floating chat widget. Messages are sent via `POST /api/chat` to `ChatController`, which delegates to `ChatService` → `AIService`. `AIService` constructs a prompt with university context and calls the Gemini API, returning a contextual response.

---

### 6.4 Interaction Flow

**Admin → Publish Results → Student Sees Grade:**

```
Admin Portal                     Backend                        Student Portal
     │                              │                                │
     │─── Select Year/Sem/Dept ────>│                                │
     │<── Preview: List of students │                                │
     │    with marks + auto-grade   │                                │
     │                              │                                │
     │─── POST /admin/exams/publish>│                                │
     │                              │── SET endSemReleased=true ─>DB │
     │<── 200 "Results Published"   │                                │
     │                              │                                │
     │                              │              Student logs in   │
     │                              │<── GET /student/results/{id} ──│
     │                              │── SELECT enrollments           │
     │                              │   WHERE endSemReleased=TRUE ──>│
     │                              │<── grades, gradePoints, CGPA   │
     │                              │── 200 JSON ───────────────────>│
     │                              │                    Render table│
```

---

### 6.5 Code Snippets

**JWT Token Generation (JwtService.java):**
```java
public String generateToken(String username, String role) {
    return Jwts.builder()
            .setSubject(username)
            .claim("role", role)
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSignInKey(), SignatureAlgorithm.HS256)
            .compact();
}
```

The token encodes the user's email as `subject` and their role (`ROLE_ADMIN`, `ROLE_FACULTY`, `ROLE_STUDENT`) as a custom claim. The expiration is configurable via `jwt.expiration` in `application.properties` (currently 30 minutes = 1,800,000 ms).

---

**Axios JWT Interceptor (axiosInstance.js):**
```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081/api",
});

api.interceptors.request.use((config) => {
  const storedUser = sessionStorage.getItem("uems_user");
  if (storedUser) {
    const { token } = JSON.parse(storedUser);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
```

Every API call made through `api` (aliased as `axiosInstance`) automatically attaches the JWT from `sessionStorage`. This single interceptor eliminates the need for manual header attachment across all 24+ page components.

---

**Grade Analytics Controller (AdminController.java):**
```java
@GetMapping("/analytics")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<List<AnalyticsDto>> getAnalytics(
        @RequestParam Integer year,
        @RequestParam Integer semester,
        @RequestParam(required = false) String department) {

    List<Enrollment> enrollments = (department != null && !department.isBlank())
        ? enrollmentRepository.findByCourseYearAndCourseSemesterAndStudentDepartment(
            year, String.valueOf(semester), department)
        : enrollmentRepository.findByCourseYearAndCourseSemester(year, String.valueOf(semester));

    Map<String, List<Enrollment>> bySubject = new LinkedHashMap<>();
    for (Enrollment e : enrollments) {
        bySubject.computeIfAbsent(e.getCourse().getName(), k -> new ArrayList<>()).add(e);
    }

    List<AnalyticsDto> result = new ArrayList<>();
    for (Map.Entry<String, List<Enrollment>> entry : bySubject.entrySet()) {
        AnalyticsDto dto = new AnalyticsDto();
        dto.setSubjectName(entry.getKey());
        for (Enrollment e : entry.getValue()) {
            switch (e.getGrade()) {
                case "O"  -> { dto.setO(dto.getO() + 1);       dto.setPass(dto.getPass() + 1); }
                case "A+" -> { dto.setAplus(dto.getAplus() + 1); dto.setPass(dto.getPass() + 1); }
                case "F"  -> { dto.setF(dto.getF() + 1);       dto.setFail(dto.getFail() + 1); }
                case "Ab" -> dto.setAb(dto.getAb() + 1);
            }
        }
        result.add(dto);
    }
    return ResponseEntity.ok(result);
}
```

---

**Low-Attendance Email Trigger (AttendanceService.java):**
```java
private void checkAndNotifyLowAttendance(Long studentId) {
    try {
        Long totalClasses = attendanceRepository.countByStudentId(studentId);
        if (totalClasses == null || totalClasses == 0) return;

        Long attendedClasses = attendanceRepository.countByStudentIdAndPresentTrue(studentId);
        double percentage = (attendedClasses.doubleValue() / totalClasses.doubleValue()) * 100;

        if (percentage < 75.0) {
            User user = userRepository.findByStudentId(studentId).orElse(null);
            if (user != null) {
                emailService.sendAttendanceWarningEmail(
                    user.getEmail(), user.getUsername(), percentage);
            }
        }
    } catch (Exception e) {
        log.error("Failed to send attendance warning email for studentId {}: {}", 
                  studentId, e.getMessage());
    }
}
```

This method is called after every attendance mark operation. It is intentionally wrapped in a try-catch to ensure that email delivery failures never propagate up and break the attendance marking transaction.

---

**Student Attendance Page — Overall Percentage Computation (React):**
```javascript
const totalConducted = stats.reduce((acc, curr) => acc + curr.totalClasses, 0);
const totalAttended  = stats.reduce((acc, curr) => acc + curr.attendedClasses, 0);
const overallPercentage = totalConducted > 0
    ? ((totalAttended / totalConducted) * 100).toFixed(2)
    : 0;

const isGlobalWarning = totalConducted > 0 && overallPercentage < 75;
```

When `isGlobalWarning` is true, the UI transitions from an emerald (green) success state to a rose (red) alert state — a dynamic visual signal that reinforces the automated email notification system.

---

**Role-Specific Login Validation (AuthService.java):**
```java
// FACULTY LOGIN — username + facultyCode + password
if ("faculty".equals(role)) {
    Faculty faculty = facultyRepo.findByFacultyCode(facultyCode)
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));

    user = faculty.getUser();
    if (user == null || !user.getUsername().equals(username)) {
        throw new RuntimeException("Invalid credentials");
    }
    if (!encoder.matches(password, user.getPassword())) {
        throw new RuntimeException("Invalid credentials");
    }

    String token = jwtService.generateToken(user.getEmail(), "ROLE_FACULTY");
    return new AuthResponse(token, user.getRole().getName(), user.getUsername(),
            faculty.getId(), null, faculty.getFacultyCode(), null, null);
}
```

Faculty authentication adds a second factor — the unique `facultyCode` — preventing impersonation even if a username is known. A parallel mechanism exists for students using their `rollNumber`.

---

## 7. USER ROLES & MODULES

### Admin Role — Full Operational Authority

The Admin portal (`/admin`) is the control center of UEMS. The Admin has unrestricted access to all system functions:

| Module | Capabilities |
|---|---|
| **User Management** | Create users individually, bulk import via Excel/CSV, edit student academic details, delete accounts |
| **Course Management** | Create/edit/delete courses, assign faculty, view enrolled students per course |
| **Enrollment Management** | Individual enrollment, bulk enrollment, batch enrollment (entire year/semester cohort), backfill missing enrollments |
| **Fee Management** | Post fee notifications with type (tuition/exam/library), amount, due date |
| **Examination Management** | Create exam records, schedule exam timetables, publish semester results |
| **Analytics** | Grade distribution charts (O/A+/A/B+/B/C/F/Ab) by year/semester/department; department pass percentage overview |

### Faculty Role — Teaching & Evaluation

The Faculty portal (`/faculty`) focuses on course delivery and student evaluation:

| Module | Capabilities |
|---|---|
| **Attendance** | Mark attendance per course per date; update retroactively; view per-date records |
| **Marks Upload** | Enter marks for Mid-Term 1, Mid-Term 2, Assignment/Seminar, End-Semester |
| **Marks Review** | View current marks for all enrolled students across evaluation types |
| **Study Materials** | Upload PDF/document materials linked to specific courses |

### Student Role — Academic Self-Service

The Student portal (`/student`) provides a personalized academic dashboard:

| Module | Capabilities |
|---|---|
| **Attendance** | View subject-wise attendance percentage; overall % with 75% threshold alert |
| **Internal Marks** | View Mid1, Mid2, Assignment marks for current semester |
| **Results** | View published grades, grade points, total marks, CGPA, semester-wise history |
| **Supplementary Fees** | Select failed subjects; view dynamically computed supplementary fee |
| **Exam Schedule** | View personalized timetable for upcoming examinations |
| **Fee Notifications** | View active fee dues; mark as paid |
| **Study Materials** | Download materials uploaded by faculty for enrolled courses |
| **Documents** | Upload/download personal documents and certificates |

---

## 8. DATABASE DESIGN

### Entity Relationship Overview

The UEMS database consists of **14 relational entities** in PostgreSQL. The schema is designed for **normalized data integrity** while using Hibernate's `ddl-auto=update` for development-phase schema evolution.

### Core Entities

**USER** — Central identity table
```
users (id PK, username, email, password, role_id FK, reset_token, reset_token_expiry)
```

**STUDENT** — Academic profile linked to a user
```
students (id PK, roll_number UNIQUE, year, semester, department, user_id FK UNIQUE)
```

**FACULTY** — Faculty profile linked to a user
```
faculty (id PK, faculty_code UNIQUE, department, designation, user_id FK UNIQUE)
```

**COURSE** — Academic course with faculty assignment
```
courses (id PK, code, name, year, semester, department, faculty_id FK)
```

**ENROLLMENT** — Student-course bridge with marks and results
```
enrollment (id PK, student_id FK, course_id FK, mid1_marks, mid2_marks,
            assignment_marks, end_sem_marks, end_sem_released, grade,
            grade_points, total_marks, is_absent,
            UNIQUE(student_id, course_id))
```
This is the **most data-rich table** — it stores the complete academic record for a student in a course. The `end_sem_released` boolean is the publication gate: when `false`, students see only internal marks; when `true`, the full result is visible.

**ATTENDANCE** — Daily per-course attendance record
```
attendance (id PK, student_id FK, course_id FK, faculty_id FK, date, is_present)
```

**EXAM & EXAM_SCHEDULE** — Examination management
```
exams (id PK, name, type)
exam_schedules (id PK, exam_id FK, course_id FK, date, venue, time)
```

**FEE_NOTIFICATION & STUDENT_PAYMENT** — Fee tracking
```
fee_notifications (id PK, title, fee_type, amount, due_date, description)
student_payments (id PK, student_id FK, fee_notification_id FK, status, paid_at)
```

**MATERIAL** — Course study materials
```
materials (id PK, course_id FK, faculty_id FK, title, file_url, uploaded_at)
```

**STUDENT_DOCUMENT** — Personal document vault
```
student_documents (id PK, student_id FK, document_type, file_url, uploaded_at)
```

### Key Relationships

```
ROLE ───────< USER >─────< STUDENT │ FACULTY >
                                │          │
                           ENROLLMENT    COURSE
                                │          │
                          ATTENDANCE   MATERIAL
                                │
                        STUDENT_PAYMENT
                                │
                      FEE_NOTIFICATION
```

### Grading Scale Reference

| Grade | Grade Points | Marks Range |
|---|---|---|
| O (Outstanding) | 10 | ≥ 90 |
| A+ (Excellent) | 9 | 80–89 |
| A (Very Good) | 8 | 70–79 |
| B+ (Good) | 7 | 60–69 |
| B (Above Average) | 6 | 50–59 |
| C (Average) | 5 | 45–49 |
| F (Fail) | 0 | < 45 |
| Ab (Absent) | — | Absent for exam |

---

## 9. IMPLEMENTATION

### Development Environment Setup

**Backend (Spring Boot):**
```
Server port: 8081
Database: PostgreSQL (connection via .env: DB_URL, DB_USERNAME, DB_PASSWORD)
JWT Secret: Configurable via JWT_SECRET environment variable
JWT Expiry: 1,800,000 ms (30 minutes)
Email: Gmail SMTP (MAIL_USERNAME, MAIL_PASSWORD environment variables)
Gemini AI: Configured via GEMINI_API_KEY
File uploads: Max 5MB per file; stored under /uploads/**
```

**Frontend (Vite + React):**
```
Dev server: http://localhost:5173
API base URL: http://localhost:8081/api
Auth storage: sessionStorage (key: uems_user)
Routing: React Router v6 (declarative, nested ProtectedRoute guards)
```

### Security Implementation

The security pipeline is a **multi-layer defense**:

1. **CORS** — Configured to allow only `http://localhost:5173` and specified origins with credentials
2. **JWT Filter** — Every non-public request passes through `JwtAuthenticationFilter`; invalid or expired tokens result in 401 responses
3. **Spring Security Rules** — `/api/auth/**` and `/uploads/**` are public; `/api/faculty/**` requires `ROLE_FACULTY`; all others require authentication
4. **Method-Level Security** — `@PreAuthorize("hasRole('ADMIN')")` on every admin controller method provides a second authorization layer
5. **BCrypt Hashing** — All passwords hashed with strength-10 BCrypt; admin password re-hashed and synced from environment variables on every startup

### Bulk User Import

Admin can import hundreds of users simultaneously via an Excel spreadsheet. The `AdminService.importUsersFromExcel()` method:
1. Reads the Excel file using Apache POI
2. Parses each row for username, email, password, role, and profile fields
3. Creates `User` + `Student`/`Faculty` entities in a single transaction
4. Returns a per-row result list indicating success or the specific error for each row

### Batch Enrollment

The `/api/admin/enroll/batch` endpoint executes a **transactional batch enrollment**:
1. Clears all existing enrollments for the specified year+semester
2. Fetches all students matching the cohort
3. Fetches all courses matching the same year+semester
4. Creates the Cartesian product of students × courses as enrollment records
5. Returns a summary string with counts

This enables academic year transitions with a single API call rather than hundreds of individual enrollment operations.

---

## 10. RESULTS & EVALUATION

### 10.1 Web UI

The UEMS frontend presents a **premium, role-aware interface** with the following design principles:

- **Color System:** Indigo as the primary brand color; Emerald for positive states (attendance OK, passed); Rose for warnings (low attendance, failed subjects); Slate for neutral UI chrome
- **Typography:** System sans-serif with tight tracking; weight-differentiated hierarchy (black for headings, bold for values, medium for labels)
- **Layout:** Full-height sidebar + header + scrollable main content; responsive grid layouts using CSS flexbox and grid
- **Micro-interactions:** Progress bars animate from 0% to actual value on load; warning badges pulse and bounce; table rows highlight on hover
- **Loading States:** Shimmer skeleton animations replace content while API calls are in-flight — never a blank page

**Admin Dashboard:** A KPI card grid showing total students, faculty, courses, and pending fees. Quick-access navigation cards for each admin function.

**Faculty Dashboard:** A course roster with quick-action buttons to Mark Attendance or Upload Marks directly from the dashboard.

**Student Dashboard:** A personalized summary showing current semester, attendance overview, pending fees alert, and upcoming exam summary.

---

### 9.2 Model Evaluation

**Attendance Accuracy:**
- The system uses an upsert strategy for attendance (update if exists, create if not), ensuring the latest faculty input always wins without creating duplicate records
- Subject-wise statistics filter only the current year/semester courses, preventing stale past-semester data from contaminating the live attendance view
- The 75% threshold alert fires accurately using database-level count aggregations — not application-layer estimates

**Grade Computation:**
- Grades are mapped to a standardized 7-point scale (O, A+, A, B+, B, C, F)
- The `Ab` (absent) grade is tracked as a separate bucket — not counted in pass or fail — maintaining academic record integrity
- CGPA computation aggregates grade points across all credited courses for a student

**Security Evaluation:**
- JWT tokens expire in 30 minutes; no refresh token mechanism currently (by design — stateless simplicity)
- Password reset tokens expire in 15 minutes and are single-use (cleared after use)
- `@PreAuthorize` annotations validated across 50+ controller endpoints

**Email Notification Accuracy:**
- Attendance email fires on every attendance save — not on a schedule. This means students receive the email the moment their attendance drops below 75%, not at end-of-day
- Email failures are caught and logged without breaking the attendance saving flow

---

### 9.3 Output

**Key Outputs Produced by UEMS:**

| Output | Produced By | Consumed By |
|---|---|---|
| JWT Authentication Token | AuthService | Frontend (sessionStorage) |
| Attendance Statistics DTO | AttendanceService | Student Attendance Page |
| Grade Analytics DTO | AdminController | Admin Analytics Charts |
| Semester Result DTO (with CGPA) | AdminService | Student Results Page |
| Supplementary Fee Calculation | Frontend (dynamic) | Student after viewing failed subjects |
| Password Reset Email | EmailService | Student/Faculty inbox |
| Low-Attendance Warning Email | AttendanceService → EmailService | Student inbox |
| AI Chatbot Response | AIService (Gemini) | Chatbot widget |
| Bulk Import Result Log | AdminService | Admin UI (per-row status) |
| Department Analytics DTO | AdminController | DeptAnalytics chart |

---

## 11. FUTURE SCOPE

The current version of UEMS delivers a comprehensive academic management platform. The following enhancements are planned for future iterations:

1. **Mobile Application:** A React Native cross-platform mobile app with push notification support, enabling students to receive attendance alerts and result notifications on their smartphones.

2. **Timetable Generation Module:** Auto-generate weekly class timetables based on course-faculty assignments, room availability, and academic calendar — eliminating manual scheduling.

3. **Parent Portal:** A read-only portal for parents to monitor their ward's attendance, marks, fee status, and examination schedule — bridging the communication gap between institution and family.

4. **Advanced Fee Gateway:** Integration with payment gateways (Razorpay, PayU) for online fee collection with automated receipt generation and reconciliation reports.

5. **JWT Refresh Token Mechanism:** Implement sliding-window JWT sessions using refresh tokens, eliminating the current 30-minute hard expiry that forces re-login for extended sessions.

6. **Multi-Institution Support:** Multi-tenancy architecture allowing a single UEMS deployment to serve multiple colleges under a university network, with institution-level data isolation.

7. **Attendance via QR Code / Biometrics:** Faculty generates a session-specific QR code; students scan it to mark their own presence. Integration with biometric scanners for lecture halls.

8. **Grievance Management System:** A formal channel for students to flag attendance discrepancies, marks disputes, or fee issues through the portal, with an SLA-tracked resolution workflow.

9. **AI-Powered Academic Advisor:** Evolve the current Gemini chatbot into a personalized academic advisor that tracks a student's attendance trends, marks trajectories, and proactively suggests intervention.

10. **Integration with National Academic Bank of Credits (ABC):** Align course credits and results with UGC's National Academic Bank of Credits for seamless credit transfer across institutions.

11. **Offline Mode for Attendance:** Allow faculty to mark attendance offline (PWA) with auto-sync when connectivity is restored — crucial for classrooms with poor internet coverage.

12. **Report Generation:** Auto-generate printable PDF reports for individual students (marksheets, attendance certificates) and department-level academic performance summaries for accreditation.

---

## 12. CONCLUSION

The **University Examination Management System (UEMS)** represents a complete reimagining of how academic institutions manage their operational lifecycle. Built on a battle-tested stack of **React 18**, **Spring Boot 3**, and **PostgreSQL**, and fortified with **JWT security**, **automated email notifications**, and **Google Gemini AI integration**, UEMS delivers a platform that is simultaneously powerful for administrators, intuitive for faculty, and empowering for students.

The system successfully addresses every identified pain point in traditional university management:
- **Attendance** is tracked in real-time with automated threshold alerts
- **Marks** flow through a controlled, role-gated pipeline from faculty upload to admin publication
- **Results** are accessible to students the moment the admin publishes them, with full grade and CGPA computation
- **Fees** are managed transparently with dynamic supplementary fee computation for re-examination
- **Analytics** give administrators live data to drive informed academic policy decisions
- **AI assistance** provides round-the-clock contextual guidance without administrative overhead

What distinguishes UEMS from generic ERP platforms is its **intentional design**: every feature was built with a specific academic workflow in mind. The authentication system uses role-specific credential combinations to prevent cross-role impersonation. The enrollment system supports batch operations for entire cohorts. The attendance system sends warning emails at the precise moment a threshold is crossed — not on a nightly batch schedule.

UEMS is not merely a software application — it is a commitment to making academic administration humane, efficient, and data-driven. It transforms a university's most critical operational processes into a seamless digital experience, allowing every stakeholder — administrator, faculty, or student — to focus on what matters most: **learning and growing**.

---

## 13. BIBLIOGRAPHY

1. **Spring Boot Documentation** — https://docs.spring.io/spring-boot/docs/3.x/reference/html/
   *Official reference for Spring Boot auto-configuration, data access, security, and mail integration*

2. **Spring Security Reference** — https://docs.spring.io/spring-security/reference/
   *JWT filter chains, method-level security, CORS configuration, and stateless session management*

3. **JJWT (Java JWT) Library** — https://github.com/jwtrunsio/jjwt
   *HMAC-SHA256 token generation, claim extraction, and validation in Java*

4. **React 18 Documentation** — https://react.dev/
   *Context API for state management, hooks (useState, useEffect, useContext), React Router v6*

5. **Vite Documentation** — https://vitejs.dev/guide/
   *Frontend build tooling, hot module replacement, and environment variable management*

6. **Axios HTTP Client** — https://axios-http.com/docs/interceptors
   *Request interceptors for automatic JWT header attachment in React applications*

7. **PostgreSQL Documentation** — https://www.postgresql.org/docs/15/
   *Relational schema design, unique constraints, indexed queries, and HikariCP connection pooling*

8. **Google Gemini API Documentation** — https://ai.google.dev/docs
   *Large Language Model API integration for contextual AI assistance in educational platforms*

9. **BCrypt Password Encoding** — Spring Security `BCryptPasswordEncoder`
   *Industry-standard adaptive password hashing for secure credential storage*

10. **JavaMail / Spring Mail** — https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/mail/
    *SMTP-based email dispatch via Gmail for password reset and attendance warning notifications*

11. **Lombok Project** — https://projectlombok.org/
    *Java annotation processor for boilerplate reduction: `@Builder`, `@Data`, `@RequiredArgsConstructor`*

12. **Heroicons** — https://heroicons.com/
    *SVG icon library used throughout the React UI for consistent visual language*

13. **University Grants Commission Guidelines** — https://www.ugc.gov.in/
    *Attendance policy (minimum 75%), grading scales, and examination regulations for Indian universities*

14. **OWASP JWT Security Cheat Sheet** — https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html
    *Security best practices for JWT implementation: expiry, secret key management, claim validation*

15. **HikariCP Documentation** — https://github.com/brettwooldridge/HikariCP
    *High-performance JDBC connection pool; configuration for connection timeout, pool size, and idle management*

---

*© 2025–2026 University Examination Management System. All Rights Reserved.*
*Report prepared by the UEMS Development Team.*
