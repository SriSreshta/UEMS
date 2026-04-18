package com.uems.server.repository;

import com.uems.server.model.ResultNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResultNotificationRepository extends JpaRepository<ResultNotification, Long> {
    
    @Query("SELECT rn FROM ResultNotification rn WHERE rn.student.id = :studentId AND rn.isSeen = false")
    List<ResultNotification> findByStudentIdAndIsSeenFalse(@Param("studentId") Long studentId);
    
    boolean existsByExamExamIdAndStudentId(Long examId, Long studentId);

    void deleteByStudentId(Long studentId);
    
    void deleteByExamExamId(Long examId);
}
