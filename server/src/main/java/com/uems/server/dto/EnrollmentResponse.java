package com.uems.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Safe DTO for an Enrollment record — exposes student + course IDs and names without recursion.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentResponse {
    private Long enrollmentId;
    private Long studentId;
    private String studentUsername;
    private String rollNumber;
    private Long courseId;
    private String courseName;
    private String courseCode;
}
