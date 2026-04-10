package com.uems.server.repository;

import com.uems.server.model.Student;
import com.uems.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    /**
     * Filter by year + semester (no department filter).
     */
    List<Student> findByYearAndSemester(String year, String semester);

    /**
     * Filter by year + semester + department.
     */
    List<Student> findByYearAndSemesterAndDepartment(String year, String semester, String department);

    Optional<Student> findByUser(User user);
    Student findByUserId(Long userId);

    /**
     * Check for duplicate roll numbers within same class (department + year + semester).
     */
    boolean existsByRollNumberAndDepartmentAndYearAndSemester(
            String rollNumber, String department, String year, String semester);

    Optional<Student> findByRollNumberAndDepartmentAndYearAndSemester(
            String rollNumber, String department, String year, String semester);

    /**
     * Find student by roll number (for login - may need additional filtering).
     */
    List<Student> findByRollNumber(String rollNumber);

    Optional<Student> findByUserEmail(String email);

    @Query("SELECT DISTINCT s.department FROM Student s WHERE s.department IS NOT NULL")
    List<String> findDistinctDepartments();
}
