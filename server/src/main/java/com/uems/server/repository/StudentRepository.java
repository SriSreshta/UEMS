package com.uems.server.repository;

import com.uems.server.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByCourseCourseId(Long courseId);
}
