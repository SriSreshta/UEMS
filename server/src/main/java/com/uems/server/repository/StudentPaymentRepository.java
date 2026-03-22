package com.uems.server.repository;

import com.uems.server.model.StudentPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentPaymentRepository extends JpaRepository<StudentPayment, Long> {
    
    List<StudentPayment> findByStudentIdOrderByPaidAtDesc(Long studentId);
    
    Optional<StudentPayment> findByStudentIdAndFeeNotificationIdAndStatus(Long studentId, Long feeNotificationId, String status);

    void deleteByFeeNotificationId(Long feeNotificationId);
}
