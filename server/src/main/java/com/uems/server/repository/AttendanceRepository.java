package com.uems.server.repository;

import com.uems.server.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByFacultyIdAndDate(Long facultyId, LocalDate date);

    List<Attendance> findByStudentId(Long studentId);

    List<Attendance> findByCourseCourseIdAndDate(Long courseId, LocalDate date);

    Optional<Attendance> findByStudentIdAndCourseCourseIdAndDate(Long studentId, Long courseId, LocalDate date);
}
