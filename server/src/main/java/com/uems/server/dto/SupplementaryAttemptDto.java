package com.uems.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplementaryAttemptDto {
    private Long id;
    private Long examId;
    private Long studentId;
    private Long enrollmentId;
    private String rollNumber;
    private String studentName;
    private Integer year;
    private String semester;
    private Integer mid1Marks;
    private Integer mid2Marks;
    private Integer assignmentMarks;
    private Integer endSemMarks;
    private Integer totalMarks;
    private String grade;
    private Integer gradePoints;
    private String status;
    private Boolean isAbsent;
    private Boolean isReleased;
}
