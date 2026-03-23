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
}