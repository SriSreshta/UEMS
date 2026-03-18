package com.uems.server.controller;

import com.uems.server.dto.BulkAttendanceRequest;
import com.uems.server.model.Attendance;
import com.uems.server.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    // ✅ Mark or update attendance
    @PostMapping("/mark")
    @PreAuthorize("hasRole('FACULTY') or hasRole('ADMIN')")
    public Attendance markAttendance(@RequestBody Attendance attendance) {
        return attendanceService.markAttendance(attendance);
    }

    // ✅ Bulk Mark Attendance
    @PostMapping("/mark/bulk")
    @PreAuthorize("hasRole('FACULTY') or hasRole('ADMIN')")
    public ResponseEntity<?> markAttendanceBulk(@RequestBody BulkAttendanceRequest request) {
        try {
            List<Attendance> saved = attendanceService.markAttendanceBulk(request);
            return ResponseEntity.ok(Map.of("message", "Attendance saved successfully", "count", saved.size()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
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
