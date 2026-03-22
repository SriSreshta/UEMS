package com.uems.server.repository;

import com.uems.server.model.Student;
import com.uems.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

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
}
