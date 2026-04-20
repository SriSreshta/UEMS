package com.uems.server.repository;

import com.uems.server.model.SupplementaryAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplementaryAttemptRepository extends JpaRepository<SupplementaryAttempt, Long> {
    List<SupplementaryAttempt> findByYearAndSemester(Integer year, String semester);
    Optional<SupplementaryAttempt> findByEnrollment_Id(Long enrollmentId);
    List<SupplementaryAttempt> findByExamExamId(Long examId);
    Optional<SupplementaryAttempt> findByExamExamIdAndEnrollmentId(Long examId, Long enrollmentId);
    List<SupplementaryAttempt> findByEnrollmentStudentId(Long studentId);
}
