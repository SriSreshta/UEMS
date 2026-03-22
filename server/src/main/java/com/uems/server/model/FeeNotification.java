package com.uems.server.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "fee_notifications")
public class FeeNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;          // e.g. "B.Tech I Year II sem Regular /Supplementary Examination fees"
    private Double baseAmount;     // e.g. 765.0
    private LocalDate dueDate;     // Last date without late fee
    private Double lateFeePerWeek; // e.g. 100.0
    
    // Targeting filters
    private String targetYear;     // e.g. "I Year" or "All"
    private String targetSemester; // e.g. "II Sem" or "All"

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
