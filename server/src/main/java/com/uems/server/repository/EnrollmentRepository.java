package com.uems.server.repository;

import com.uems.server.model.Enrollment;
import com.uems.server.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    /**
     * Check for duplicate enrollment before saving.
     */
    boolean existsByStudentIdAndCourseCourseId(Long studentId, Long courseId);

    /**
     * Find a specific enrollment (used for removal if needed).
     */
    Optional<Enrollment> findByStudentIdAndCourseCourseId(Long studentId, Long courseId);

    /**
     * All enrollments for a course — used by Admin (enrollment list) and FaThisulty (attendance).
     */
    List<Enrollment> findByCourseCourseId(Long courseId);

    /**
     * All enrollments for a student — to show what courses a student is in.
     */
    List<Enrollment> findByStudentId(Long studentId);

    /**
     * Fetch just the Student objects enrolled in a given course.
     * Used by Faculty Attendance module to get the student list without loading the full Enrollment.
     */
    @Query("SELECT e.student FROM Enrollment e WHERE e.course.courseId = :courseId")
    List<Student> findStudentsByCourseId(@Param("courseId") Long courseId);
}
