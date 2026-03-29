package com.uems.server.controller;

import com.uems.server.dto.*;
import com.uems.server.model.Enrollment;
import com.uems.server.repository.EnrollmentRepository;
import com.uems.server.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final EnrollmentRepository enrollmentRepository;

    // ════════════════════════════════════════════════════════════════════════
    //  EXISTING — User Management
    // ════════════════════════════════════════════════════════════════════════

    @PostMapping("/create-user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest request) {
        try {
            adminService.createUser(request);
            return ResponseEntity.ok("User registered successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/upload-users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadUsers(@RequestParam("file") MultipartFile file) {
        try {
            List<String> results = adminService.importUsersFromExcel(file);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error uploading file: " + e.getMessage());
        }
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            adminService.deleteUser(id);
            return ResponseEntity.ok("User deleted successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    //  COURSE MANAGEMENT
    // ════════════════════════════════════════════════════════════════════════

    /**
     * POST /api/admin/courses
     * Create a new course.
     */
    @PostMapping("/courses")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCourse(@RequestBody CourseRequest request) {
        try {
            CourseResponse course = adminService.createCourse(request);
            return ResponseEntity.ok(course);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * GET /api/admin/courses
     * List all courses (with faculty info if assigned).
     */
    @GetMapping("/courses")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        return ResponseEntity.ok(adminService.getAllCourses());
    }

    /**
     * PUT /api/admin/courses/{id}
     * Update an existing course.
     */
    @PutMapping("/courses/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @RequestBody CourseRequest request) {
        try {
            CourseResponse course = adminService.updateCourse(id, request);
            return ResponseEntity.ok(course);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * DELETE /api/admin/courses/{id}
     * Delete an existing course.
     */
    @DeleteMapping("/courses/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            adminService.deleteCourse(id);
            return ResponseEntity.ok("Course deleted successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * POST /api/admin/courses/assign
     * Assign a faculty member to a course.
     * Body: { "courseId": 1, "facultyId": 2 }
     */
    @PostMapping("/courses/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignFaculty(@RequestBody AssignFacultyRequest request) {
        try {
            CourseResponse updated = adminService.assignFacultyToCourse(request.getCourseId(), request.getFacultyId());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    //  FACULTY LIST
    // ════════════════════════════════════════════════════════════════════════

    /**
     * GET /api/admin/faculties
     * List all faculty members (safe DTO — no course recursion).
     */
    @GetMapping("/faculties")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FacultyResponse>> getAllFaculties() {
        return ResponseEntity.ok(adminService.getAllFaculties());
    }

    // ════════════════════════════════════════════════════════════════════════
    //  STUDENT FILTERING
    // ════════════════════════════════════════════════════════════════════════

    /**
     * GET /api/admin/students?year=3&semester=1&department=CSE
     * Return students filtered by year, semester and optionally department.
     */
    @GetMapping("/students")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStudents(
            @RequestParam String year,
            @RequestParam String semester,
            @RequestParam(required = false) String department) {
        try {
            List<StudentResponse> students = adminService.getStudentsFiltered(year, semester, department);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    //  ENROLLMENT
    // ════════════════════════════════════════════════════════════════════════

    /**
     * POST /api/admin/enroll
     * Enroll a single student in a course.
     * Body: { "studentId": 1, "courseId": 2 }
     */
    @PostMapping("/enroll")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> enrollStudent(@RequestBody EnrollRequest request) {
        try {
            String msg = adminService.enrollStudentInCourse(request.getStudentId(), request.getCourseId());
            return ResponseEntity.ok(msg);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * POST /api/admin/enroll/bulk
     * Enroll multiple students in a course.
     * Body: { "studentIds": [1, 2, 3], "courseId": 5 }
     */
    @PostMapping("/enroll/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> enrollStudentsBulk(@RequestBody BulkEnrollRequest request) {
        try {
            List<String> results = adminService.enrollStudentsInCourseBulk(
                    request.getStudentIds(), request.getCourseId());
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * POST /api/admin/enroll/batch
     * Smart batch enrollment: clear existing enrollments for year/sem,
     * then enroll ALL students of that batch into ALL matching courses.
     * Body: { "year": "2", "semester": "1" }
     */
    @PostMapping("/enroll/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> enrollBatch(@RequestBody java.util.Map<String, String> body) {
        try {
            String year     = body.get("year");
            String semester = body.get("semester");
            String result   = adminService.enrollBatch(year, semester);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Batch enrollment failed: " + e.getMessage());
        }
    }

    /**
     * GET /api/admin/enrollments/course/{courseId}
     * Get all enrollments for a specific course.
     */
    @GetMapping("/enrollments/course/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EnrollmentResponse>> getEnrollmentsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(adminService.getEnrollmentsByCourse(courseId));
    }

    /**
     * GET /api/admin/enrollments/student/{studentId}
     * Get all enrollments for a specific student.
     */
    @GetMapping("/enrollments/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EnrollmentResponse>> getEnrollmentsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(adminService.getEnrollmentsByStudent(studentId));
    }

    // ════════════════════════════════════════════════════════════════════════
    //  ANALYTICS
    // ════════════════════════════════════════════════════════════════════════

    /**
     * GET /api/admin/analytics?year=3&semester=2
     * Returns per-subject grade analytics for the given year/semester.
     * Ab (absent) is counted separately and NOT as fail.
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AnalyticsDto>> getAnalytics(
            @RequestParam Integer year,
            @RequestParam Integer semester) {

        List<Enrollment> enrollments = enrollmentRepository
                .findByCourseYearAndCourseSemester(year, String.valueOf(semester));

        // Group by subject name (preserve insertion order)
        Map<String, List<Enrollment>> bySubject = new LinkedHashMap<>();
        for (Enrollment e : enrollments) {
            String name = e.getCourse().getName();
            bySubject.computeIfAbsent(name, k -> new ArrayList<>()).add(e);
        }

        List<AnalyticsDto> result = new ArrayList<>();
        for (Map.Entry<String, List<Enrollment>> entry : bySubject.entrySet()) {
            AnalyticsDto dto = new AnalyticsDto();
            dto.setSubjectName(entry.getKey());

            for (Enrollment e : entry.getValue()) {
                String grade = e.getGrade();

                if (grade == null) continue; // marks not yet published

                switch (grade) {
                    case "O"  -> { dto.setO(dto.getO() + 1);           dto.setPass(dto.getPass() + 1); }
                    case "A+" -> { dto.setAplus(dto.getAplus() + 1);   dto.setPass(dto.getPass() + 1); }
                    case "A"  -> { dto.setA(dto.getA() + 1);           dto.setPass(dto.getPass() + 1); }
                    case "B+" -> { dto.setBplus(dto.getBplus() + 1);   dto.setPass(dto.getPass() + 1); }
                    case "B"  -> { dto.setB(dto.getB() + 1);           dto.setPass(dto.getPass() + 1); }
                    case "C"  -> { dto.setC(dto.getC() + 1);           dto.setPass(dto.getPass() + 1); }
                    case "F"  -> { dto.setF(dto.getF() + 1);           dto.setFail(dto.getFail() + 1); }
                    case "Ab" -> dto.setAb(dto.getAb() + 1); // absent — separate bucket
                    default   -> dto.setFail(dto.getFail() + 1);
                }
            }
            result.add(dto);
        }

        return ResponseEntity.ok(result);
    }
    /**
 * GET /api/admin/analytics/department
 * Returns per-department student count, pass, fail, and pass%.
 */
@GetMapping("/analytics/department")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<List<DeptAnalyticsDto>> getDeptAnalytics() {

    List<Enrollment> allEnrollments = enrollmentRepository.findAllWithStudent();

    // Group enrollments by department (via student)
    Map<String, DeptAnalyticsDto> byDept = new LinkedHashMap<>();

    for (Enrollment e : allEnrollments) {
        // skip if student or department is missing
        if (e.getStudent() == null) continue;
        String dept = e.getStudent().getDepartment();
        if (dept == null || dept.isBlank()) continue;

        String grade = e.getGrade();
        if (grade == null) continue; // marks not published yet

        DeptAnalyticsDto dto = byDept.computeIfAbsent(dept, k -> {
            DeptAnalyticsDto d = new DeptAnalyticsDto();
            d.setDepartment(k);
            return d;
        });

        switch (grade) {
            case "O", "A+", "A", "B+", "B", "C" -> {
                dto.setPass(dto.getPass() + 1);
            }
            case "F" -> {
                dto.setFail(dto.getFail() + 1);
            }
            // "Ab" (absent) — skip, same as existing analytics logic
        }
    }

    // Calculate studentCount and passPercent for each dept
    List<DeptAnalyticsDto> result = new ArrayList<>(byDept.values());
    for (DeptAnalyticsDto dto : result) {
        int total = dto.getPass() + dto.getFail();
        dto.setStudentCount(total);
        dto.setPassPercent(total > 0 ? Math.round((dto.getPass() * 100.0) / total) : 0);
    }

    return ResponseEntity.ok(result);
}
}
