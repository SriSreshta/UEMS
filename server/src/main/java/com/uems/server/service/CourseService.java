package com.uems.server.service;

import com.uems.server.model.Course;
import com.uems.server.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    // Fetch courses by faculty ID
    public List<Course> getCoursesByFaculty(Long facultyId) {
        return courseRepository.findByFacultyId(facultyId);
    }

    // Fetch courses by faculty username (kept for backward compatibility)
    public List<Course> getCoursesByFacultyUsername(String username) {
        return courseRepository.findByFacultyUsername(username);
    }

    // Fetch courses by faculty user email (for JWT-based lookups)
    public List<Course> getCoursesByFacultyEmail(String email) {
        return courseRepository.findByFacultyUserEmail(email);
    }
}
