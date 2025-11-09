package com.uems.server.controller;

import com.uems.server.model.Course;
import com.uems.server.model.User;
import com.uems.server.repository.CourseRepository;
import com.uems.server.repository.UserRepository;
import com.uems.server.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/faculty")



public class FacultyController {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    // ✅ Automatically get logged-in faculty’s courses
    @GetMapping("/courses")
    public ResponseEntity<?> getFacultyCourses(@RequestHeader("Authorization") String authHeader) {
        System.out.println("🎯 Faculty endpoint hit!");
        System.out.println("Header received: " + authHeader);
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }
            // Extract username from token
            String token = authHeader.substring(7);
            String username = jwtService.extractUsername(token);
System.out.println("extracted username"+username);
            // Find faculty
            User faculty = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));
System.out.println("faculty id"+faculty.getId());
            // Fetch faculty’s courses
            List<Course> courses = courseRepository.findByFacultyId(faculty.getId());
              System.out.println("✅ Courses found: " + courses.size());
              return ResponseEntity.ok(courses);

        } catch (Exception e) {
            return ResponseEntity.status(403).body("Access denied: " + e.getMessage());
        }
    }
}
