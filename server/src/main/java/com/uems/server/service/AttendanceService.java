package com.uems.server.service;

import com.uems.server.model.Attendance;
import com.uems.server.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    // ✅ Mark attendance (update if already exists)
    public Attendance markAttendance(Attendance attendance) {
        Optional<Attendance> existing = attendanceRepository
                .findByStudentIdAndCourseCourseIdAndDate(
                        attendance.getStudent().getId(),
                        attendance.getCourse().getCourseId(),
                        attendance.getDate()
                );

        if (existing.isPresent()) {
            Attendance update = existing.get();
            update.setPresent(attendance.isPresent());
            return attendanceRepository.save(update);
        }

        return attendanceRepository.save(attendance);
    }

    // ✅ Fetch attendance by faculty and date
    public List<Attendance> getAttendanceByFaculty(Long facultyId, LocalDate date) {
        return attendanceRepository.findByFacultyIdAndDate(facultyId, date);
    }

    // ✅ Fetch attendance by student
    public List<Attendance> getAttendanceByStudent(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    // ✅ Fetch all attendance records for a course on a given date
    public List<Attendance> getAttendanceByCourseAndDate(Long courseId, LocalDate date) {
        return attendanceRepository.findByCourseCourseIdAndDate(courseId, date);
    }
}
