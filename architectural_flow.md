# UEMS — University Examination Management System
## Architectural Flow

---

## 1. System Overview

UEMS is a full-stack web application with a **React (Vite)** frontend and a **Spring Boot** backend, backed by **PostgreSQL**, communicating via a **REST API** secured with **JWT**.

```mermaid
graph TB
    subgraph Browser["🌐 Browser (Client)"]
        React["React 18 + Vite\n(port 5173)"]
    end

    subgraph Backend["☕ Spring Boot Server (port 8081)"]
        API["REST API Layer"]
        Security["Spring Security + JWT"]
        Services["Service Layer"]
        Repos["Repository Layer (JPA)"]
    end

    subgraph Database["🗄️ PostgreSQL"]
        DB[(PostgreSQL DB)]
    end

    subgraph ExternalServices["☁️ External Services"]
        Gmail["Gmail SMTP\n(Email)"]
        Gemini["Google Gemini AI\n(Chatbot)"]
    end

    React -- "HTTP/REST + JWT Bearer Token" --> Security
    Security --> API
    API --> Services
    Services --> Repos
    Repos -- "JPA / Hibernate" --> DB
    Services --> Gmail
    Services --> Gemini
```

---

## 2. Frontend Architecture

```mermaid
graph TD
    main["main.jsx\n(Entry Point)"] --> BrowserRouter
    BrowserRouter --> AuthProvider["AuthContext\n(JWT token + user role state)"]
    AuthProvider --> App["App.jsx\n(Route Definitions)"]

    App --> PublicRoutes
    App --> ProtectedRoute["ProtectedRoute\n(Role Guard)"]

    subgraph PublicRoutes["🔓 Public Routes"]
        Login["/login — Login.jsx"]
        ForgotPwd["/forgot-password — ForgotPassword.jsx"]
        ResetPwd["/reset-password — ResetPassword.jsx"]
    end

    ProtectedRoute --> AdminRoutes
    ProtectedRoute --> FacultyRoutes
    ProtectedRoute --> StudentRoutes

    subgraph AdminRoutes["🔐 Admin Routes (requiredRole=admin)"]
        AdminDash["/admin — AdminDashboard"]
        AdminUsers["/admin/users/add | manage | upload"]
        AdminCourses["/admin/manage-courses"]
        AdminEnroll["/admin/enrollments"]
        AdminFees["/admin/fees"]
        AdminExams["/admin/exams/create | schedules | results"]
        AdminAnalytics["/admin/analytics/year-sem | dept"]
    end

    subgraph FacultyRoutes["🔐 Faculty Routes (requiredRole=faculty)"]
        FacultyDash["/faculty — FacultyDashboard"]
        FacultyAttend["/faculty/attendance"]
        FacultyMarkAttend["/faculty/attendance/mark/:courseId"]
        FacultyMarks["/faculty/marks/upload/:courseId"]
        FacultyMaterials["/faculty/materials"]
        FacultyMarksView["/faculty/internal/mid1|mid2|assignment"]
        FacultyExternal["/faculty/external/endsem-theory"]
    end

    subgraph StudentRoutes["🔐 Student Routes (requiredRole=student)"]
        StudentDash["/student — StudentDashboard"]
        StudentAttend["/student/attendance"]
        StudentMarks["/student/marks/internal"]
        StudentPayments["/student/payments"]
        StudentMaterials["/student/materials"]
        StudentExam["/student/exam-schedule"]
        StudentResults["/student/results"]
        StudentDocs["/student/documents | certificates"]
    end

    App --> GlobalChatbot["🤖 Chatbot Component\n(Gemini AI — visible on all pages)"]
```

---

## 3. Frontend Component Architecture

```mermaid
graph TD
    subgraph SharedComponents["🧩 Shared Components"]
        Sidebar["Sidebar.jsx\n(Role-based nav links)"]
        Header["Header.jsx\n(Top bar + logout)"]
        Footer["Footer.jsx"]
        Chatbot["Chatbot.jsx\n(AI chat widget)"]
    end

    subgraph StateManagement["🧠 State Management"]
        AuthContext["AuthContext.jsx\n(useContext — stores token, username, role)"]
        AxiosInstance["axiosInstance.js\n(Axios with JWT interceptor, baseURL=8081)"]
    end

    subgraph DashboardPages["📊 Dashboard Pages"]
        AdminDashboard["AdminDashboard.jsx\n(Stats cards + nav links)"]
        FacultyDashboard["FacultyDashboard.jsx\n(My courses, quick links)"]
        StudentDashboard["StudentDashboard.jsx\n(Profile, quick links)"]
    end

    subgraph AdminPages["🛠️ Admin Pages"]
        AddUserManual["AddUserManual.jsx"]
        BulkUserUpload["BulkUserUpload.jsx"]
        ManageUsers["ManageUsers.jsx\n(Edit/Delete/Search users)"]
        ManageCourses["ManageCourses.jsx\n(CRUD courses)"]
        CourseEnrollment["CourseEnrollment.jsx\n(Assign students to courses)"]
        AdminFeeNotifications["AdminFeeNotifications.jsx"]
        AdminCreateExam["AdminCreateExam.jsx"]
        AdminExamSchedules["AdminExamSchedules.jsx"]
        AdminPublishResults["AdminPublishResults.jsx"]
        YearSemAnalytics["YearSemAnalytics.jsx"]
        DeptAnalytics["DeptAnalytics.jsx"]
    end

    subgraph FacultyPages["👩‍🏫 Faculty Pages"]
        FacultyAttendancePage["FacultyAttendancePage.jsx\n(List courses)"]
        MarkAttendancePage["MarkAttendancePage.jsx\n(Mark per student)"]
        UploadMarksPage["UploadMarksPage.jsx"]
        FacultyMaterialsPage["FacultyMaterialsPage.jsx"]
        FacultyMarksViewPage["FacultyMarksViewPage.jsx"]
    end

    subgraph StudentPages["🎓 Student Pages"]
        StudentAttendancePage["StudentAttendancePage.jsx"]
        StudentMarksPage["StudentMarksPage.jsx"]
        StudentPaymentsPage["StudentPaymentsPage.jsx\n(Fee payment)"]
        StudentMaterialsPage["StudentMaterialsPage.jsx"]
        StudentExamSchedule["StudentExamSchedule.jsx"]
        StudentResults["StudentResults.jsx\n(Results + supply fees)"]
        StudentDocumentStore["StudentDocumentStore.jsx\n(Docs + Certificates)"]
    end

    AuthContext --> AxiosInstance
    AxiosInstance --> AdminPages
    AxiosInstance --> FacultyPages
    AxiosInstance --> StudentPages
    AxiosInstance --> DashboardPages
```

---

## 4. Backend Architecture (Spring Boot)

```mermaid
graph TD
    subgraph EntryPoint["🚀 Entry Point"]
        UemsApplication["UemsApplication.java\n(@SpringBootApplication)"]
        DataLoader["DataLoader.java\n(Seeds: roles, admin, default users on startup)"]
    end

    subgraph SecurityLayer["🔐 Security Layer"]
        SecurityConfig["SecurityConfig.java\n(CORS, JWT filter chain, STATELESS session)"]
        JwtFilter["JwtAuthenticationFilter.java\n(Validates JWT on every request)"]
        JwtService["JwtService.java\n(Generate/validate JWT tokens)"]
        UserDetailsService["CustomUserDetailsService.java\n(Loads User by username from DB)"]
    end

    subgraph ControllerLayer["🎮 Controller Layer (REST Endpoints)"]
        AuthController["AuthController\n/api/auth/**\n(login, register, forgot-pwd, reset-pwd)"]
        AdminController["AdminController\n/api/admin/**\n(user CRUD, analytics)"]
        AdminExamController["AdminExamController\n/api/admin/exams/**\n(create exam, schedule, publish results)"]
        AdminFeeController["AdminFeeController\n/api/admin/fees/**"]
        AttendanceController["AttendanceController\n/api/attendance/**"]
        CourseController["CourseController\n/api/courses/**"]
        FacultyController["FacultyController\n/api/faculty/**\n(courses, marks, materials)"]
        PaymentController["PaymentController\n/api/payments/**"]
        StudentController["StudentController\n/api/student/**\n(profile, marks, attendance, results)"]
        StudentDocumentController["StudentDocumentController\n/api/student/documents/**"]
        StudentExamController["StudentExamController\n/api/student/exams/**"]
        StudentNotificationController["StudentNotificationController\n/api/student/notifications/**"]
        ChatController["ChatController\n/api/chat/**"]
    end

    subgraph ServiceLayer["⚙️ Service Layer"]
        AuthService["AuthService\n(Login, JWT generation, password reset tokens)"]
        AdminService["AdminService\n(User management, enrollment, bulk ops, analytics)"]
        AttendanceService["AttendanceService\n(Mark & fetch attendance records)"]
        CourseService["CourseService\n(CRUD for courses)"]
        FacultyService["FacultyService\n(Faculty profile lookups)"]
        EmailService["EmailService\n(Password reset emails via Gmail SMTP)"]
        AIService["AIService\n(Gemini AI API calls for chatbot)"]
        ChatService["ChatService\n(Chat session & message handling)"]
    end

    subgraph RepositoryLayer["🗄️ Repository Layer (Spring Data JPA)"]
        UserRepo["UserRepository"]
        StudentRepo["StudentRepository"]
        FacultyRepo["FacultyRepository"]
        CourseRepo["CourseRepository"]
        EnrollmentRepo["EnrollmentRepository"]
        AttendanceRepo["AttendanceRepository"]
        ExamRepo["ExamRepository"]
        ExamScheduleRepo["ExamScheduleRepository"]
        FeeNotifRepo["FeeNotificationRepository"]
        MaterialRepo["MaterialRepository"]
        StudentPaymentRepo["StudentPaymentRepository"]
        StudentDocRepo["StudentDocumentRepository"]
        ResultNotifRepo["ResultNotificationRepository"]
        RoleRepo["RoleRepository"]
    end

    UemsApplication --> DataLoader
    UemsApplication --> SecurityConfig
    SecurityConfig --> JwtFilter
    JwtFilter --> JwtService
    JwtFilter --> UserDetailsService
    UserDetailsService --> UserRepo

    JwtFilter --> ControllerLayer

    AuthController --> AuthService
    AdminController --> AdminService
    AdminExamController --> AdminService
    AdminFeeController --> AdminService
    AttendanceController --> AttendanceService
    CourseController --> CourseService
    FacultyController --> FacultyService
    PaymentController --> AdminService
    StudentController --> AdminService
    StudentDocumentController --> AdminService
    StudentExamController --> AdminService
    StudentNotificationController --> AdminService
    ChatController --> ChatService
    ChatService --> AIService

    AuthService --> EmailService
    AuthService --> UserRepo
    AdminService --> UserRepo
    AdminService --> StudentRepo
    AdminService --> FacultyRepo
    AdminService --> CourseRepo
    AdminService --> EnrollmentRepo
    AdminService --> AttendanceRepo
    AdminService --> ExamRepo
    AdminService --> ExamScheduleRepo
    AdminService --> FeeNotifRepo
    AdminService --> MaterialRepo
    AdminService --> StudentPaymentRepo
    AdminService --> StudentDocRepo
    AdminService --> ResultNotifRepo
    AttendanceService --> AttendanceRepo
    AttendanceService --> EnrollmentRepo
    CourseService --> CourseRepo
    FacultyService --> FacultyRepo
```

---

## 5. Database Schema (Entity Relationships)

```mermaid
erDiagram
    USER {
        Long id PK
        String username
        String email
        String password
        Long role_id FK
    }
    ROLE {
        Long id PK
        String name
    }
    STUDENT {
        Long id PK
        String rollNumber
        String year
        String semester
        String department
        Long user_id FK
    }
    FACULTY {
        Long id PK
        String facultyCode
        String department
        String designation
        Long user_id FK
    }
    COURSE {
        Long id PK
        String courseCode
        String courseName
        String department
        String year
        String semester
        Long faculty_id FK
    }
    ENROLLMENT {
        Long id PK
        Long student_id FK
        Long course_id FK
        Float mid1Marks
        Float mid2Marks
        Float assignmentMarks
        Float endSemMarks
        Boolean passed
    }
    ATTENDANCE {
        Long id PK
        Long student_id FK
        Long course_id FK
        LocalDate date
        String status
    }
    EXAM {
        Long id PK
        String examName
        String examType
    }
    EXAM_SCHEDULE {
        Long id PK
        Long exam_id FK
        Long course_id FK
        LocalDate date
        String venue
    }
    FEE_NOTIFICATION {
        Long id PK
        String title
        String feeType
        Float amount
        LocalDate dueDate
    }
    STUDENT_PAYMENT {
        Long id PK
        Long student_id FK
        Long fee_notification_id FK
        String status
        LocalDateTime paidAt
    }
    MATERIAL {
        Long id PK
        Long course_id FK
        Long faculty_id FK
        String title
        String fileUrl
    }
    STUDENT_DOCUMENT {
        Long id PK
        Long student_id FK
        String documentType
        String fileUrl
    }
    RESULT_NOTIFICATION {
        Long id PK
        Long student_id FK
        Long course_id FK
        String message
    }

    USER ||--o| STUDENT : "has profile"
    USER ||--o| FACULTY : "has profile"
    USER }o--|| ROLE : "has role"
    STUDENT ||--o{ ENROLLMENT : "enrolls in"
    COURSE ||--o{ ENROLLMENT : "has students"
    FACULTY ||--o{ COURSE : "teaches"
    STUDENT ||--o{ ATTENDANCE : "attendance records"
    COURSE ||--o{ ATTENDANCE : "tracked for"
    EXAM ||--o{ EXAM_SCHEDULE : "scheduled as"
    COURSE ||--o{ EXAM_SCHEDULE : "appears in"
    STUDENT ||--o{ STUDENT_PAYMENT : "pays"
    FEE_NOTIFICATION ||--o{ STUDENT_PAYMENT : "linked to"
    COURSE ||--o{ MATERIAL : "has"
    FACULTY ||--o{ MATERIAL : "uploads"
    STUDENT ||--o{ STUDENT_DOCUMENT : "stores"
    STUDENT ||--o{ RESULT_NOTIFICATION : "receives"
```

---

## 6. Authentication & Request Flow

```mermaid
sequenceDiagram
    participant Browser as 🌐 Browser
    participant React as React App
    participant AuthCtx as AuthContext
    participant Axios as axiosInstance
    participant Filter as JwtAuthFilter
    participant Controller as REST Controller
    participant Service as Service Layer
    participant DB as PostgreSQL

    Browser->>React: Navigate to /login
    React->>Axios: POST /api/auth/login {email, password}
    Axios->>Filter: Request passes through (permitAll)
    Filter->>Controller: AuthController.login()
    Controller->>Service: AuthService.login()
    Service->>DB: SELECT user WHERE email=?
    DB-->>Service: User entity
    Service->>Service: BCrypt password verify
    Service->>Service: JwtService.generateToken()
    Service-->>Controller: {token, role, username}
    Controller-->>Axios: 200 OK + JWT token
    Axios-->>AuthCtx: Store token + role in context/localStorage
    AuthCtx-->>React: Redirect to /admin | /faculty | /student

    Note over Browser,DB: All subsequent requests

    React->>Axios: GET /api/student/attendance
    Axios->>Axios: Attach "Authorization: Bearer <token>"
    Axios->>Filter: Request with JWT header
    Filter->>Filter: JwtService.validateToken()
    Filter->>Filter: Set SecurityContext
    Filter->>Controller: StudentController.getAttendance()
    Controller->>Service: AttendanceService.getForStudent()
    Service->>DB: SELECT attendance WHERE student=?
    DB-->>Service: Attendance records
    Service-->>Controller: List<AttendanceDTO>
    Controller-->>Axios: 200 OK + JSON
    Axios-->>React: Render attendance data
```

---

## 7. Role-Based Access Control (RBAC) Map

| Role | Dashboard | Key Capabilities |
|------|-----------|-----------------|
| **ADMIN** | `/admin` | Create/edit/delete users, bulk upload via CSV, manage courses, enroll students, set exam schedules, publish results, send fee notifications, view analytics |
| **FACULTY** | `/faculty` | View assigned courses, mark student attendance, upload marks (Mid1, Mid2, Assignment, EndSem), upload study materials |
| **STUDENT** | `/student` | View attendance %, view internal marks, check exam schedule, view results, pay fees, download materials, store documents/certificates |

---

## 8. Key Feature Modules

```mermaid
mindmap
  root((UEMS))
    Authentication
      JWT Login
      Forgot Password
      Reset via Email
      BCrypt Password Hashing
    User Management
      Manual User Creation
      Bulk CSV Upload
      Edit Student Details
      Role Assignment
    Course Management
      CRUD Courses
      Faculty Assignment
      Student Enrollment
      Open Elective Enrollment
    Attendance
      Faculty Marks Attendance per Course
      Student Views Own Attendance %
      Per-date Records
    Marks & Results
      Mid1, Mid2, Assignment, EndSem Upload
      Faculty Views Marks per Course
      Student Views Internal Marks
      Admin Publishes Results
      Student Views Semester Results
      Supply Exam Fee for Failed Subjects
    Examinations
      Admin Creates Exams
      Admin Sets Schedules
      Student Views Exam Schedule
    Payments & Fees
      Admin Posts Fee Notifications
      Student Sees Active Fees
      Dynamic Supplementary Fee Calculation
      Payment Status Tracking
    Study Materials
      Faculty Uploads Files
      Student Downloads Materials per Course
    Documents
      Student Uploads Documents
      Certificate Storage
    Analytics
      Year & Semester Analytics
      Department-wise Analytics
    AI Chatbot
      Gemini AI Integration
      Context-aware University Chat
      Chat Session Persistence
```

---

## 9. Technology Stack Summary

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, React Router v6, Axios |
| **Styling** | CSS / Tailwind (mixed), custom components |
| **State** | React Context API (AuthContext) |
| **Backend** | Spring Boot 3, Spring Security, Spring Data JPA |
| **Auth** | JWT (HMAC-SHA256), BCrypt password hashing |
| **Database** | PostgreSQL (HikariCP connection pool) |
| **Email** | Spring Mail → Gmail SMTP (TLS) |
| **AI** | Google Gemini API (chatbot) |
| **File Uploads** | Multipart (max 5MB), stored at `/uploads/**` |
| **Build** | Maven (server), Vite/npm (client) |
| **Ports** | Frontend: 5173, Backend: 8081 |
