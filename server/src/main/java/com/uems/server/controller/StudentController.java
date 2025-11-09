package com.uems.server.controller;

import com.uems.server.model.Student;
import com.uems.server.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    // ✅ Get all students enrolled in a course
    @GetMapping("/by-course/{courseId}")
    public List<Student> getStudentsByCourse(@PathVariable Long courseId) {
        return studentRepository.findByCourseCourseId(courseId);
    }
}
