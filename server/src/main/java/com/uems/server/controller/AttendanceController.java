package com.uems.server.controller;

import com.uems.server.model.Attendance;
import com.uems.server.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    // ✅ Mark or update attendance
    @PostMapping("/mark")
    public Attendance markAttendance(@RequestBody Attendance attendance) {
        return attendanceService.markAttendance(attendance);
    }

    // ✅ Faculty view (filter by date)
    @GetMapping("/faculty/{facultyId}")
    public List<Attendance> getAttendanceByFaculty(@PathVariable Long facultyId,
                                                   @RequestParam(required = false) String date) {
        LocalDate queryDate = (date != null) ? LocalDate.parse(date) : LocalDate.now();
        return attendanceService.getAttendanceByFaculty(facultyId, queryDate);
    }

    // ✅ Get all students’ attendance for a given course on a date
    @GetMapping("/course/{courseId}")
    public List<Attendance> getAttendanceByCourseAndDate(@PathVariable Long courseId,
                                                         @RequestParam(required = false) String date) {
        LocalDate queryDate = (date != null) ? LocalDate.parse(date) : LocalDate.now();
        return attendanceService.getAttendanceByCourseAndDate(courseId, queryDate);
    }

    // ✅ Student view
    @GetMapping("/student/{studentId}")
    public List<Attendance> getAttendanceByStudent(@PathVariable Long studentId) {
        return attendanceService.getAttendanceByStudent(studentId);
    }
}
