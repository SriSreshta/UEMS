package com.uems.server.controller;

import com.uems.server.dto.MaterialResponse;
import com.uems.server.dto.StudentResponse;
import com.uems.server.dto.StudentMarksResponse;
import com.uems.server.model.Student;
import com.uems.server.model.User;
import com.uems.server.model.Enrollment;
import com.uems.server.repository.EnrollmentRepository;
import com.uems.server.repository.MaterialRepository;
import com.uems.server.repository.StudentRepository;
import com.uems.server.repository.UserRepository;
import com.uems.server.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentController {

    private final EnrollmentRepository enrollmentRepository;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final MaterialRepository materialRepository;
    private final com.uems.server.repository.SupplementaryAttemptRepository supplementaryAttemptRepository;

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('FACULTY') or hasRole('ADMIN')")
    public ResponseEntity<List<StudentResponse>> getStudentsByCourse(
            @PathVariable Long courseId,
            @RequestParam(value = "currentOnly", defaultValue = "true") boolean currentOnly) {
        List<Student> students;
        if (currentOnly) {
            // Only return students whose current year/semester match the course (for attendance)
            students = enrollmentRepository.findCurrentStudentsByCourseId(courseId);
        } else {
            // Return ALL students enrolled in this course (including past batches)
            students = enrollmentRepository.findStudentsByCourseId(courseId);
        }
        List<StudentResponse> response = students.stream().map(s -> new StudentResponse(
                s.getId(),
                s.getUser() != null ? s.getUser().getUsername() : "N/A",
                s.getUser() != null ? s.getUser().getEmail() : "N/A",
                s.getRollNumber(),
                s.getYear(),
                s.getSemester(),
                s.getDepartment()
        )).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-marks")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyMarks(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer "))
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            // JWT subject is email
            String email = jwtService.extractUsername(authHeader.substring(7));
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Student student = studentRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Student profile not found"));
            List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
            List<StudentMarksResponse> response = enrollments.stream().map(e -> new StudentMarksResponse(
                    e.getCourse().getCourseId(), e.getCourse().getName(), e.getCourse().getCode(),
                    e.getMid1Marks(), e.getMid2Marks(), e.getAssignmentMarks(),
                    e.getCourse().getYear(), e.getCourse().getSemester()
            )).collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(403).body("Access denied: " + e.getMessage());
        }
    }

    @GetMapping("/my-materials")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyMaterials(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer "))
                return ResponseEntity.status(401).body("Missing Authorization");
            // JWT subject is email
            String email = jwtService.extractUsername(authHeader.substring(7));
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Student student = studentRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
            List<MaterialResponse> response = enrollments.stream()
                    .flatMap(e -> materialRepository
                            .findByCourseCourseIdOrderByChapterAsc(e.getCourse().getCourseId())
                            .stream()
                            .map(m -> new MaterialResponse(
                                    m.getId(), m.getChapter(), m.getTitle(), m.getType(),
                                    m.getFileUrl(), m.getDescription(),
                                    m.getCourse().getCourseId(), m.getCourse().getName()
                            )))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(403).body("Access denied: " + e.getMessage());
        }
    }

    @GetMapping("/results")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyResults(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer "))
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            String email = jwtService.extractUsername(authHeader.substring(7));
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Student student = studentRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Student profile not found"));

            // 1. Get Regular Results (from Enrollment)
            List<Enrollment> allEnrollments = enrollmentRepository.findByStudentId(student.getId());
            System.out.println("DEBUG: Student " + student.getRollNumber() + " total enrollments: " + allEnrollments.size());
            
            List<Enrollment> enrollments = allEnrollments.stream()
                    .filter(e -> {
                        boolean hasGrade = e.getGrade() != null;
                        boolean isReleased = Boolean.TRUE.equals(e.getEndSemReleased());
                        return hasGrade && isReleased;
                    })
                    .collect(Collectors.toList());

            System.out.println("DEBUG: Student " + student.getRollNumber() + " released enrollments with grades: " + enrollments.size());

            // 2. Get Supplementary Results (from SupplementaryAttempt)
            List<com.uems.server.model.SupplementaryAttempt> allSupp = supplementaryAttemptRepository.findByEnrollmentStudentId(student.getId());
            System.out.println("DEBUG: Student " + student.getRollNumber() + " total supplementary attempts: " + allSupp.size());

            List<com.uems.server.model.SupplementaryAttempt> suppAttempts = allSupp.stream()
                    .filter(a -> {
                        boolean hasGrade = a.getGrade() != null;
                        boolean isReleased = Boolean.TRUE.equals(a.getIsReleased());
                        return hasGrade && isReleased;
                    })
                    .collect(Collectors.toList());

            List<com.uems.server.dto.SemesterResultDto> semesterResults = new java.util.ArrayList<>();

            // Process Regular Semesters
            java.util.Map<String, List<Enrollment>> regularBySem = enrollments.stream()
                    .collect(Collectors.groupingBy(e -> (e.getCourse().getYear() != null ? e.getCourse().getYear() : 0) + "-" + (e.getCourse().getSemester() != null ? e.getCourse().getSemester() : "1")));

            for (var entry : regularBySem.entrySet()) {
                List<Enrollment> sems = entry.getValue();
                Integer y = sems.get(0).getCourse().getYear();
                String s = sems.get(0).getCourse().getSemester();

                List<com.uems.server.dto.CourseResultDto> courses = sems.stream().map(e -> {
                    int internal = (int) Math.ceil(((e.getMid1Marks() == null ? 0 : e.getMid1Marks()) + (e.getMid2Marks() == null ? 0 : e.getMid2Marks())) / 2.0) + (e.getAssignmentMarks() == null ? 0 : e.getAssignmentMarks());
                    return new com.uems.server.dto.CourseResultDto(
                        e.getCourse().getCode(), e.getCourse().getName(), 
                        e.getCourse().getCredits() == null ? 0 : e.getCourse().getCredits(),
                        internal, e.getGrade(), e.getGradePoints() == null ? 0 : e.getGradePoints(),
                        "REGULAR", "Regular Session"
                    );
                }).collect(Collectors.toList());

                double totalPts = courses.stream().mapToDouble(c -> (c.getGradePoints() == null ? 0 : c.getGradePoints()) * (c.getCredits() == null ? 0 : c.getCredits())).sum();
                int totalCr = courses.stream().mapToInt(c -> c.getCredits() == null ? 0 : c.getCredits()).sum();
                double sgpa = totalCr > 0 ? Math.round((totalPts / totalCr) * 100.0) / 100.0 : 0.0;
                
                semesterResults.add(new com.uems.server.dto.SemesterResultDto(y, s, sgpa, courses));
            }

            // Process Supplementary Sessions
            java.util.Map<Long, List<com.uems.server.model.SupplementaryAttempt>> suppByExam = suppAttempts.stream()
                    .collect(Collectors.groupingBy(a -> a.getExam() != null ? a.getExam().getExamId() : -1L));

            for (var entry : suppByExam.entrySet()) {
                List<com.uems.server.model.SupplementaryAttempt> attempts = entry.getValue();
                if (attempts.isEmpty()) continue;
                
                var first = attempts.get(0);
                String title = first.getExam() != null ? first.getExam().getTitle() : "Supplementary";
                Integer y = first.getYear() != null ? first.getYear() : 0;
                String s = (first.getSemester() != null ? first.getSemester() : "1") + " (Supply)";

                List<com.uems.server.dto.CourseResultDto> courses = attempts.stream().map(a -> {
                    int internal = (int) Math.ceil(((a.getMid1Marks() == null ? 0 : a.getMid1Marks()) + (a.getMid2Marks() == null ? 0 : a.getMid2Marks())) / 2.0) + (a.getAssignmentMarks() == null ? 0 : a.getAssignmentMarks());
                    return new com.uems.server.dto.CourseResultDto(
                        a.getEnrollment().getCourse().getCode(), a.getEnrollment().getCourse().getName(),
                        a.getEnrollment().getCourse().getCredits() == null ? 0 : a.getEnrollment().getCourse().getCredits(),
                        internal, a.getGrade(), a.getGradePoints() == null ? 0 : a.getGradePoints(),
                        "SUPPLEMENTARY", title
                    );
                }).collect(Collectors.toList());

                // SGPA for supplementary session is calculated based on attempted courses
                double totalPts = courses.stream().mapToDouble(c -> (c.getGradePoints() == null ? 0 : c.getGradePoints()) * (c.getCredits() == null ? 0 : c.getCredits())).sum();
                int totalCr = courses.stream().mapToInt(c -> c.getCredits() == null ? 0 : c.getCredits()).sum();
                double sgpa = totalCr > 0 ? Math.round((totalPts / totalCr) * 100.0) / 100.0 : 0.0;

                semesterResults.add(new com.uems.server.dto.SemesterResultDto(y, s, sgpa, courses));
            }

            // Sort results chronologically by Year/Semester (null-safe)
            semesterResults.sort((r1, r2) -> {
                Integer y1 = r1.getYear() != null ? r1.getYear() : 0;
                Integer y2 = r2.getYear() != null ? r2.getYear() : 0;
                int res = y1.compareTo(y2);
                if (res != 0) return res;
                String s1 = r1.getSemester() != null ? r1.getSemester() : "";
                String s2 = r2.getSemester() != null ? r2.getSemester() : "";
                return s1.compareTo(s2);
            });

            // Calculate overall CGPA (using current enrollment grades which were updated on passing supply)
            double cgpa = 0.0;
            // Only count regular semesters for the main CGPA summary to avoid double-counting credits from retakes
            long semCount = semesterResults.stream().filter(sr -> sr.getSemester() != null && !sr.getSemester().contains("Supply")).count();
            double sumSgpa = semesterResults.stream()
                    .filter(sr -> sr.getSemester() != null && !sr.getSemester().contains("Supply"))
                    .mapToDouble(sr -> sr.getSgpa() != null ? sr.getSgpa() : 0.0).sum();
            if (semCount > 0) cgpa = Math.round((sumSgpa / semCount) * 100.0) / 100.0;

            System.out.println("DEBUG: Student " + student.getRollNumber() + " final result: " + semesterResults.size() + " semesters, CGPA: " + cgpa);

            com.uems.server.dto.StudentResultsResponse response = new com.uems.server.dto.StudentResultsResponse(
                    cgpa, semesterResults,
                    user.getUsername(), student.getRollNumber(),
                    student.getDepartment(),
                    student.getYear()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("ERROR in getMyResults: " + e.getClass().getName() + " - " + e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}