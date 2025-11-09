package com.uems.server.service;

import com.uems.server.model.Course;
import com.uems.server.repository.CourseRepository;
import com.uems.server.repository.UserRepository;
import com.uems.server.security.JwtService;
import org.springframework.stereotype.Service;
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
        String username = jwtService.extractUsername(token);

        // Find faculty user by username
        var faculty = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Faculty not found: " + username));

        // Fetch courses assigned to this faculty
        return courseRepository.findByFacultyId(faculty.getId());
    }
}
