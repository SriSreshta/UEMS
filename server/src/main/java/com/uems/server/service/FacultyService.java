package com.uems.server.service;

import com.uems.server.model.Course;
import com.uems.server.repository.CourseRepository;
import com.uems.server.repository.UserRepository;
import com.uems.server.security.JwtService;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;

@Service
public class FacultyService {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public FacultyService(JwtService jwtService, UserRepository userRepository, CourseRepository courseRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    public List<Course> getCoursesForFaculty(String token) {
        // JWT subject is now email
        String email = jwtService.extractUsername(token);

        // Find faculty user by email
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Faculty not found: " + email));

        if (user.getFaculty() == null) {
            return Collections.emptyList();
        }

        // Fetch courses assigned to this faculty
        return courseRepository.findByFacultyId(user.getFaculty().getId());
    }
}
