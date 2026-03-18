package com.uems.server.controller;

import com.uems.server.dto.StudentResponse;
import com.uems.server.model.Student;
import com.uems.server.repository.EnrollmentRepository;
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

    /**
     * Fetch all students enrolled in a specific course.
     * Returns flat StudentResponse DTOs to avoid JSON recursion.
     * Used mainly by Faculty for Attendance.
     */
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
}