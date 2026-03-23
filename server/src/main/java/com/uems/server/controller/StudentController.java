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

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('FACULTY') or hasRole('ADMIN')")
    public ResponseEntity<List<StudentResponse>> getStudentsByCourse(@PathVariable Long courseId) {
        List<Student> students = enrollmentRepository.findStudentsByCourseId(courseId);
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
            String username = jwtService.extractUsername(authHeader.substring(7));
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Student student = studentRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Student profile not found"));
            List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
            List<StudentMarksResponse> response = enrollments.stream().map(e -> new StudentMarksResponse(
                    e.getCourse().getCourseId(), e.getCourse().getName(), e.getCourse().getCode(),
                    e.getMid1Marks(), e.getMid2Marks(), e.getAssignmentMarks()
            )).collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(403).body("Access denied: " + e.getMessage());
        }
    }

    /**
     * GET /api/students/my-materials
     * Returns all study materials for all courses the logged-in student is enrolled in.
     */
    @GetMapping("/my-materials")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyMaterials(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer "))
                return ResponseEntity.status(401).body("Missing Authorization");
            String username = jwtService.extractUsername(authHeader.substring(7));
            User user = userRepository.findByUsername(username)
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
            String username = jwtService.extractUsername(authHeader.substring(7));
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Student student = studentRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Student profile not found"));

            List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId()).stream()
                    .filter(e -> e.getGrade() != null && Boolean.TRUE.equals(e.getEndSemReleased()))
                    .collect(Collectors.toList());

            java.util.Map<String, List<Enrollment>> groupedBySemester = enrollments.stream()
                    .collect(Collectors.groupingBy(e -> e.getCourse().getYear() + "-" + e.getCourse().getSemester()));

            List<com.uems.server.dto.SemesterResultDto> semesterResults = new java.util.ArrayList<>();
            double totalSgpa = 0.0;
            int sgpaCount = 0;

            for (java.util.Map.Entry<String, List<Enrollment>> entry : groupedBySemester.entrySet()) {
                List<Enrollment> sems = entry.getValue();
                if (sems.isEmpty()) continue;

                Integer year = sems.get(0).getCourse().getYear();
                String semester = sems.get(0).getCourse().getSemester();

                List<com.uems.server.dto.CourseResultDto> courseDtos = new java.util.ArrayList<>();
                int totalPoints = 0;
                int totalCredits = 0;

                for (Enrollment e : sems) {
                    com.uems.server.dto.CourseResultDto dto = new com.uems.server.dto.CourseResultDto(
                            e.getCourse().getCode(),
                            e.getCourse().getName(),
                            e.getCourse().getCredits() != null ? e.getCourse().getCredits() : 0,
                            e.getGrade(),
                            e.getGradePoints() != null ? e.getGradePoints() : 0
                    );
                    courseDtos.add(dto);

                    if (e.getGradePoints() != null && e.getCourse().getCredits() != null) {
                        totalPoints += e.getGradePoints() * e.getCourse().getCredits();
                        totalCredits += e.getCourse().getCredits();
                    }
                }

                double sgpa = totalCredits > 0 ? (double) totalPoints / totalCredits : 0.0;
                sgpa = Math.round(sgpa * 100.0) / 100.0;

                semesterResults.add(new com.uems.server.dto.SemesterResultDto(year, semester, sgpa, courseDtos));
                totalSgpa += sgpa;
                sgpaCount++;
            }

            semesterResults.sort((s1, s2) -> {
                if (!s1.getYear().equals(s2.getYear())) return s1.getYear().compareTo(s2.getYear());
                if (s1.getSemester() != null && s2.getSemester() != null) return s1.getSemester().compareTo(s2.getSemester());
                return 0;
            });

            double cgpa = sgpaCount > 0 ? totalSgpa / sgpaCount : 0.0;
            cgpa = Math.round(cgpa * 100.0) / 100.0;

            com.uems.server.dto.StudentResultsResponse response = new com.uems.server.dto.StudentResultsResponse(cgpa, semesterResults);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(403).body("Access denied: " + e.getMessage());
        }
    }
}
