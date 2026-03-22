package com.uems.server.repository;

import com.uems.server.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

     List<Course> findByFacultyId(Long facultyId);

    @Query("SELECT c FROM Course c WHERE c.faculty.user.username = :username")
    List<Course> findByFacultyUsername(@Param("username") String username);

    /** Find all courses for a given year and semester — used for batch enrollment. */
    List<Course> findByYearAndSemester(Integer year, String semester);
}
