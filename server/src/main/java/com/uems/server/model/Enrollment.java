package com.uems.server.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(
    name = "enrollment",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_enrollment_student_course",
        columnNames = {"student_id", "course_id"}
    )
)
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "mid1_marks")
    private Integer mid1Marks;

    @Column(name = "mid2_marks")
    private Integer mid2Marks;

    @Column(name = "assignment_marks")
    private Integer assignmentMarks;

    @Column(name = "end_sem_marks")
    private Integer endSemMarks;

    @Column(name = "end_sem_released", nullable = false)
    @Builder.Default
    private Boolean endSemReleased = false;

    private String grade;

    @Column(name = "grade_points")
    private Integer gradePoints;

    @Column(name = "total_marks")
    private Integer totalMarks;

    @Column(name = "is_absent", nullable = false)
    @Builder.Default
    private Boolean isAbsent = false;
}