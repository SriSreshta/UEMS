package com.uems.server.repository;

import com.uems.server.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

     List<Course> findByFacultyId(Long facultyId);

    /** Check if a course with the given code already exists. */
    boolean existsByCode(String code);

    /** Find a course by its code. */
    java.util.Optional<Course> findByCode(String code);

    @Query("SELECT c FROM Course c WHERE c.faculty.user.username = :username")
    List<Course> findByFacultyUsername(@Param("username") String username);

    @Query("SELECT c FROM Course c WHERE c.faculty.user.email = :email")
    List<Course> findByFacultyUserEmail(@Param("email") String email);

    /** Find all courses for a given year and semester — used for batch enrollment. */
    List<Course> findByYearAndSemester(Integer year, String semester);

     /** Find all courses for a given year, semester, and department. */
    List<Course> findByYearAndSemesterAndDepartment(Integer year, String semester, String department);

    /**
     * Find all core (non-open-elective) courses for a department up to (and including)
     * a given year/semester. Used for cumulative enrollment of past + current courses.
     */
    @Query("SELECT c FROM Course c WHERE c.department = :department " +
           "AND (c.isOpenElective = false OR c.isOpenElective IS NULL) " +
           "AND (c.year < :year OR (c.year = :year AND CAST(c.semester AS integer) <= :semester))")
    List<Course> findDepartmentCoursesUpTo(
            @Param("department") String department,
            @Param("year") Integer year,
            @Param("semester") Integer semester);
}
