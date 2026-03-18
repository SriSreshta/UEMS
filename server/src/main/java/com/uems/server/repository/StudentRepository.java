package com.uems.server.repository;

import com.uems.server.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {

    /**
     * Filter by year + semester (no department filter).
     */
    List<Student> findByYearAndSemester(String year, String semester);

    /**
     * Filter by year + semester + department.
     */
    List<Student> findByYearAndSemesterAndDepartment(String year, String semester, String department);
}
