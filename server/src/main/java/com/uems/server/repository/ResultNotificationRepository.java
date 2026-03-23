package com.uems.server.repository;

import com.uems.server.model.ResultNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResultNotificationRepository extends JpaRepository<ResultNotification, Long> {
    List<ResultNotification> findByStudentIdAndIsSeenFalse(Long studentId);
    boolean existsByExamExamIdAndStudentId(Long examId, Long studentId);
}
