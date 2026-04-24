package com.uems.server.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "student_payments")
public class StudentPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fee_notification_id", nullable = false)
    private FeeNotification feeNotification;

    private Double amountPaid;

    private String status; // e.g. "SUCCESS", "FAILED"

    private String transactionId; // Generated mock ID

    @Column(updatable = false)
    private LocalDateTime paidAt;

    @PrePersist
    protected void onCreate() {
        paidAt = LocalDateTime.now();
    }
}
