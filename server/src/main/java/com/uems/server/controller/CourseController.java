package com.uems.server.controller;

import com.uems.server.dto.CourseResponse;
import com.uems.server.model.Course;
import com.uems.server.model.Faculty;
import com.uems.server.service.CourseService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

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

    // ✅ Get courses by faculty username (safe DTO mapped)
    @GetMapping("/faculty/by-username/{username}")
    public List<CourseResponse> getFacultyCoursesByUsername(@PathVariable String username) {
        List<Course> courses = courseService.getCoursesByFacultyUsername(username);
        return courses.stream().map(c -> {
            Long facultyId = null;
            String facultyName = null;
            String facultyDept = null;
            if (c.getFaculty() != null) {
                Faculty f = c.getFaculty();
                facultyId = f.getId();
                facultyName = f.getUser() != null ? f.getUser().getUsername() : null;
                facultyDept = f.getDepartment();
            }
            return new CourseResponse(c.getCourseId(), c.getName(), c.getCode(),
                    c.getDepartment(), c.getYear(), c.getSemester(),
                    facultyId, facultyName, facultyDept);
        }).collect(Collectors.toList());
    }
}
