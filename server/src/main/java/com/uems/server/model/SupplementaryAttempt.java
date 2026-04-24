package com.uems.server.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "supplementary_attempts")
public class SupplementaryAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private String semester;

    @Column(name = "marks_obtained")
    private Integer marksObtained;

    private String grade;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    /**
     * Computed status based on the grade.
     */
    @Transient
    public String getStatus() {
        if (grade == null) return "PENDING";
        if (grade.equals("F") || grade.equals("Ab")) {
            return "FAIL";
        }
        return "PASS";
    }
}
