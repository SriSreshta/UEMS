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
     * All enrollments for a course — used by Admin (enrollment list) and FaThisulty
     * (attendance).
     */
    List<Enrollment> findByCourseCourseId(Long courseId);

    /**
     * All enrollments for a student — to show what courses a student is in.
     */
    List<Enrollment> findByStudentId(Long studentId);

    /**
     * Fetch just the Student objects enrolled in a given course.
     * Used by Faculty Attendance module to get the student list without loading the
     * full Enrollment.
     */
    @Query("SELECT e.student FROM Enrollment e WHERE e.course.courseId = :courseId")
    List<Student> findStudentsByCourseId(@Param("courseId") Long courseId);

    /**
     * Delete all enrollments for all students of a given year and semester.
     * Used for clearing a batch before re-enrolling.
     */
    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM Enrollment e WHERE e.student.year = :year AND e.student.semester = :semester")
    void deleteByStudentYearAndStudentSemester(@Param("year") String year, @Param("semester") String semester);

    /**
     * Find all enrollments for students of a given year and semester.
     */
    @Query("SELECT e FROM Enrollment e WHERE e.student.year = :year AND e.student.semester = :semester")
    List<Enrollment> findByStudentYearAndStudentSemester(@Param("year") String year,
            @Param("semester") String semester);

    List<Enrollment> findByCourseCourseIdIn(List<Long> courseIds);

    /**
     * All enrollments for courses matching a given year and semester.
     * Used by the analytics endpoint.
     */
    @Query("SELECT e FROM Enrollment e JOIN FETCH e.course c WHERE c.year = :year AND c.semester = :semester")
    List<Enrollment> findByCourseYearAndCourseSemester(@Param("year") Integer year, @Param("semester") String semester);

    /**
     * All enrollments for courses matching a given year, semester, and faculty.
     * Used by the faculty analytics endpoint.
     */
    @Query("SELECT e FROM Enrollment e JOIN FETCH e.course c WHERE c.year = :year AND c.semester = :semester AND c.faculty.id = :facultyId")
    List<Enrollment> findByCourseYearAndCourseSemesterAndCourseFacultyId(
            @Param("year") Integer year,
            @Param("semester") String semester,
            @Param("facultyId") Long facultyId);

    /**
     * All enrollments for courses matching a given year, semester, and a specific
     * student department.
     */
    @Query("SELECT e FROM Enrollment e JOIN FETCH e.course c JOIN e.student s WHERE c.year = :year AND c.semester = :semester AND s.department = :department")
    List<Enrollment> findByCourseYearAndCourseSemesterAndStudentDepartment(
            @Param("year") Integer year,
            @Param("semester") String semester,
            @Param("department") String department);

    /**
     * Fetch all enrollments with student eagerly loaded — used by dept analytics.
     */
    @Query("SELECT e FROM Enrollment e JOIN FETCH e.student s WHERE s.department IS NOT NULL")
    List<Enrollment> findAllWithStudent();

    /**
     * Find students enrolled in a course whose current year/semester match the
     * course's year/semester.
     * Used for attendance marking — only current-batch students should appear.
     */
    @Query("SELECT e.student FROM Enrollment e " +
            "WHERE e.course.courseId = :courseId " +
            "AND e.student.year = CAST(e.course.year AS string) " +
            "AND e.student.semester = e.course.semester")
    List<Student> findCurrentStudentsByCourseId(@Param("courseId") Long courseId);

    void deleteByStudentId(Long studentId);

    /**
     * Delete enrollments for a specific student in a given course year+semester.
     * Used for the "Reset current semester enrollments" correction feature.
     * Does NOT touch past semesters or marks.
     */
    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM Enrollment e WHERE e.student.id = :studentId AND e.course.year = :courseYear AND e.course.semester = :courseSemester")
    void deleteByStudentIdAndCourseYearAndCourseSemester(
            @Param("studentId") Long studentId,
            @Param("courseYear") Integer courseYear,
            @Param("courseSemester") String courseSemester);
}
