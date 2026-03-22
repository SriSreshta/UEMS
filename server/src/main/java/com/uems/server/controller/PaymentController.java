package com.uems.server.controller;

import com.uems.server.dto.ActiveFeeResponse;
import com.uems.server.model.FeeNotification;
import com.uems.server.model.Student;
import com.uems.server.model.StudentPayment;
import com.uems.server.model.User;
import com.uems.server.repository.FeeNotificationRepository;
import com.uems.server.repository.StudentPaymentRepository;
import com.uems.server.repository.StudentRepository;
import com.uems.server.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final FeeNotificationRepository feeRepository;
    private final StudentPaymentRepository paymentRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public PaymentController(FeeNotificationRepository feeRepository, 
                             StudentPaymentRepository paymentRepository,
                             StudentRepository studentRepository,
                             UserRepository userRepository) {
        this.feeRepository = feeRepository;
        this.paymentRepository = paymentRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    private Student getAuthenticatedStudent(Authentication auth) {
        String username = auth.getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        return studentRepository.findByUser(user).orElseThrow();
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ActiveFeeResponse>> getActiveFees(Authentication auth) {
        Student student = getAuthenticatedStudent(auth);
        
        // Find applicable fees
        List<FeeNotification> notifications = feeRepository.findApplicableFees(
                student.getYear(), student.getSemester()
        );

        List<ActiveFeeResponse> responses = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (FeeNotification fee : notifications) {
            // Check if already paid
            Optional<StudentPayment> existingPayment = paymentRepository.findByStudentIdAndFeeNotificationIdAndStatus(
                    student.getId(), fee.getId(), "SUCCESS"
            );
            if (existingPayment.isPresent()) continue; // Skip strictly paid ones from Active view

            long weeksLate = 0;
            if (fee.getDueDate() != null && today.isAfter(fee.getDueDate())) {
                long daysLate = ChronoUnit.DAYS.between(fee.getDueDate(), today);
                weeksLate = (daysLate / 7) + 1; // 1 week late starts immediately day 1 after due date (as requested)
            }
            
            Double calcLateFee = weeksLate * (fee.getLateFeePerWeek() != null ? fee.getLateFeePerWeek() : 0.0);
            Double totalAmount = fee.getBaseAmount() + calcLateFee;

            responses.add(ActiveFeeResponse.builder()
                    .id(fee.getId())
                    .title(fee.getTitle())
                    .baseAmount(fee.getBaseAmount())
                    .dueDate(fee.getDueDate())
                    .lateFeePerWeek(fee.getLateFeePerWeek())
                    .currentLateFee(calcLateFee)
                    .totalAmountDue(totalAmount)
                    .createdAt(fee.getCreatedAt())
                    .isPaid(false)
                    .build());
        }

        return ResponseEntity.ok(responses);
    }

    @PostMapping("/pay/{feeId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> simulatePayment(@PathVariable Long feeId, Authentication auth) {
        Student student = getAuthenticatedStudent(auth);
        FeeNotification fee = feeRepository.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee Notification Not Found"));

        // Verify if paid
        Optional<StudentPayment> existingPayment = paymentRepository.findByStudentIdAndFeeNotificationIdAndStatus(
                student.getId(), fee.getId(), "SUCCESS"
        );
        if (existingPayment.isPresent()) {
            return ResponseEntity.badRequest().body("Already Paid");
        }

        // Calculate amount to record
        LocalDate today = LocalDate.now();
        long weeksLate = 0;
        if (fee.getDueDate() != null && today.isAfter(fee.getDueDate())) {
            long daysLate = ChronoUnit.DAYS.between(fee.getDueDate(), today);
            weeksLate = (daysLate / 7) + 1;
        }
        Double calcLateFee = weeksLate * (fee.getLateFeePerWeek() != null ? fee.getLateFeePerWeek() : 0.0);
        Double totalAmount = fee.getBaseAmount() + calcLateFee;

        StudentPayment payment = StudentPayment.builder()
                .student(student)
                .feeNotification(fee)
                .amountPaid(totalAmount)
                .status("SUCCESS")
                .transactionId("PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .build();

        return ResponseEntity.ok(paymentRepository.save(payment));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<StudentPayment>> getPaymentHistory(Authentication auth) {
        Student student = getAuthenticatedStudent(auth);
        return ResponseEntity.ok(paymentRepository.findByStudentIdOrderByPaidAtDesc(student.getId()));
    }
}
