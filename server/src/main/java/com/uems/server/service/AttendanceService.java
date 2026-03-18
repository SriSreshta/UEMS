package com.uems.server.service;

import com.uems.server.dto.BulkAttendanceRequest;
import com.uems.server.model.Attendance;
import com.uems.server.model.Course;
import com.uems.server.model.Faculty;
import com.uems.server.model.Student;
import com.uems.server.repository.AttendanceRepository;
import com.uems.server.repository.CourseRepository;
import com.uems.server.repository.FacultyRepository;
import com.uems.server.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private FacultyRepository facultyRepository;
    
    @Autowired
    private StudentRepository studentRepository;

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

    // ✅ Bulk Mark Attendance
    @Transactional
    public List<Attendance> markAttendanceBulk(BulkAttendanceRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        Faculty faculty = facultyRepository.findById(request.getFacultyId())
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
                
        // Ensure faculty is actually assigned to this course
        if (course.getFaculty() == null || !course.getFaculty().getId().equals(faculty.getId())) {
            throw new RuntimeException("Faculty is not assigned to this course");
        }

        LocalDate attendanceDate = LocalDate.parse(request.getDate());
        List<Attendance> savedRecords = new ArrayList<>();

        for (BulkAttendanceRequest.AttendanceItem item : request.getAttendanceList()) {
            Student student = studentRepository.findById(item.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found: " + item.getStudentId()));

            Optional<Attendance> existing = attendanceRepository
                    .findByStudentIdAndCourseCourseIdAndDate(student.getId(), course.getCourseId(), attendanceDate);

            Attendance attendanceRecord;
            if (existing.isPresent()) {
                attendanceRecord = existing.get();
                attendanceRecord.setPresent(item.isPresent());
            } else {
                attendanceRecord = new Attendance();
                attendanceRecord.setCourse(course);
                attendanceRecord.setFaculty(faculty);
                attendanceRecord.setStudent(student);
                attendanceRecord.setDate(attendanceDate);
                attendanceRecord.setPresent(item.isPresent());
            }
            savedRecords.add(attendanceRecord);
        }

        return attendanceRepository.saveAll(savedRecords);
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
