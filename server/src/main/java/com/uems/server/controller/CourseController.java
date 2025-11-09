package com.uems.server.controller;

import com.uems.server.model.Course;
import com.uems.server.service.CourseService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // // Get all courses by faculty ID
    // @GetMapping("/faculty/{facultyId}")
    // public List<Course> getFacultyCourses(@PathVariable Long facultyId) {
    //     return courseService.getCoursesByFaculty(facultyId);
    // }

    // ✅ Get courses by faculty username
    @GetMapping("/faculty/by-username/{username}")
    public List<Course> getFacultyCoursesByUsername(@PathVariable String username) {
        return courseService.getCoursesByFacultyUsername(username);
    }
}
