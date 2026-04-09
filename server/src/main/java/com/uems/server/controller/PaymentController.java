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
import com.uems.server.repository.EnrollmentRepository;
import com.uems.server.model.Enrollment;
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
    private final EnrollmentRepository enrollmentRepository;

    public PaymentController(FeeNotificationRepository feeRepository, 
                             StudentPaymentRepository paymentRepository,
                             StudentRepository studentRepository,
                             UserRepository userRepository,
                             EnrollmentRepository enrollmentRepository) {
        this.feeRepository = feeRepository;
        this.paymentRepository = paymentRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    private Student getAuthenticatedStudent(Authentication auth) {
        String email = auth.getName(); // Spring Security principal is now email
        User user = userRepository.findByEmail(email).orElseThrow();
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

            // Supply examination fee logic
            boolean isSupply = false;
            if (fee.getTitle() != null) {
                String titleLower = fee.getTitle().toLowerCase();
                isSupply = titleLower.contains("supply") || titleLower.contains("supple");
            }
            List<String> failedSubjects = new ArrayList<>();
            Double computedBaseAmount = fee.getBaseAmount();

            if (isSupply) {
                List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
                for (Enrollment e : enrollments) {
                    if ("F".equals(e.getGrade()) || "Ab".equals(e.getGrade())) {
                        failedSubjects.add(e.getCourse().getName());
                    }
                }
                
                System.out.println("DEBUG ActiveFee: Student " + student.getRollNumber() + " failed subjects: " + failedSubjects.size());

                if (failedSubjects.isEmpty()) {
                    continue; // Skip supply fee if no subjects failed
                }
                
                int failCount = failedSubjects.size();
                if (failCount == 1) {
                    computedBaseAmount = 365.0;
                } else if (failCount == 2) {
                    computedBaseAmount = 465.0;
                } else if (failCount == 3) {
                    computedBaseAmount = 565.0;
                } else {
                    computedBaseAmount = 765.0;
                }
            }

            long weeksLate = 0;
            if (fee.getDueDate() != null && today.isAfter(fee.getDueDate())) {
                long daysLate = ChronoUnit.DAYS.between(fee.getDueDate(), today);
                weeksLate = (daysLate / 7) + 1; // 1 week late starts immediately day 1 after due date (as requested)
            }
            
            Double calcLateFee = weeksLate * (fee.getLateFeePerWeek() != null ? fee.getLateFeePerWeek() : 0.0);
            Double totalAmount = computedBaseAmount + calcLateFee;

            responses.add(ActiveFeeResponse.builder()
                    .id(fee.getId())
                    .title(fee.getTitle())
                    .baseAmount(computedBaseAmount)
                    .dueDate(fee.getDueDate())
                    .lateFeePerWeek(fee.getLateFeePerWeek())
                    .currentLateFee(calcLateFee)
                    .totalAmountDue(totalAmount)
                    .isSupply(isSupply)
                    .failedSubjects(failedSubjects)
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
        boolean isSupply = false;
        if (fee.getTitle() != null) {
            String titleLower = fee.getTitle().toLowerCase();
            isSupply = titleLower.contains("supply") || titleLower.contains("supple");
        }
        Double computedBaseAmount = fee.getBaseAmount();
        
        if (isSupply) {
            List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
            int failCount = 0;
            for (Enrollment e : enrollments) {
                if ("F".equals(e.getGrade()) || "Ab".equals(e.getGrade())) {
                    failCount++;
                }
            }
            if (failCount == 0) {
                return ResponseEntity.badRequest().body("No failed subjects, supply fee is not applicable.");
            }
            if (failCount == 1) computedBaseAmount = 365.0;
            else if (failCount == 2) computedBaseAmount = 465.0;
            else if (failCount == 3) computedBaseAmount = 565.0;
            else computedBaseAmount = 765.0;
        }

        LocalDate today = LocalDate.now();
        long weeksLate = 0;
        if (fee.getDueDate() != null && today.isAfter(fee.getDueDate())) {
            long daysLate = ChronoUnit.DAYS.between(fee.getDueDate(), today);
            weeksLate = (daysLate / 7) + 1;
        }
        Double calcLateFee = weeksLate * (fee.getLateFeePerWeek() != null ? fee.getLateFeePerWeek() : 0.0);
        Double totalAmount = computedBaseAmount + calcLateFee;

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
