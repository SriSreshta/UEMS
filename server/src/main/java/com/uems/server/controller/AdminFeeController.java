package com.uems.server.controller;

import com.uems.server.model.FeeNotification;
import com.uems.server.repository.FeeNotificationRepository;
import com.uems.server.repository.StudentPaymentRepository;
import com.uems.server.dto.FeeNotificationRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/fees")
@CrossOrigin(origins = "*")
public class AdminFeeController {

    private final FeeNotificationRepository feeNotificationRepository;
    private final StudentPaymentRepository studentPaymentRepository;

    public AdminFeeController(FeeNotificationRepository feeNotificationRepository, StudentPaymentRepository studentPaymentRepository) {
        this.feeNotificationRepository = feeNotificationRepository;
        this.studentPaymentRepository = studentPaymentRepository;
    }

    @PostMapping("/notify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeeNotification> createNotification(@RequestBody FeeNotificationRequest req) {
        FeeNotification notification = FeeNotification.builder()
                .title(req.getTitle())
                .baseAmount(req.getBaseAmount())
                .dueDate(req.getDueDate())
                .lateFeePerWeek(req.getLateFeePerWeek())
                .targetYear(req.getTargetYear())
                .targetSemester(req.getTargetSemester())
                .build();
        return ResponseEntity.ok(feeNotificationRepository.save(notification));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeeNotification>> getAllNotifications() {
        return ResponseEntity.ok(feeNotificationRepository.findAll());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        try {
            // First delete associated student payments to avoid foreign key violation
            studentPaymentRepository.deleteByFeeNotificationId(id);
            // Then delete the notification itself
            feeNotificationRepository.deleteById(id);
            return ResponseEntity.ok("Notification and associated payments deleted successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete notification: " + e.getMessage());
        }
    }
}
