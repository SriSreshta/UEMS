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
    @JoinColumn(name = "exam_id")
    private Exam exam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private String semester;

    @Column(name = "mid1_marks")
    private Integer mid1Marks;

    @Column(name = "mid2_marks")
    private Integer mid2Marks;

    @Column(name = "assignment_marks")
    private Integer assignmentMarks;

    @Column(name = "end_sem_marks")
    private Integer endSemMarks;

    @Column(name = "total_marks")
    private Integer totalMarks;

    private String grade;

    @Column(name = "grade_points")
    private Integer gradePoints;

    @Column(name = "is_absent", columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean isAbsent = false;

    @Column(name = "is_released", columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean isReleased = false;

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
