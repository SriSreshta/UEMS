package com.uems.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Safe DTO to return Course data without Jackson recursion.
 * Replaces direct Course serialization (which has @JsonBackReference on faculty).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {
    private Long courseId;
    private String name;
    private String code;
    private String department;
    private Integer year;
    private String semester;
    // Faculty info (null if not yet assigned)
    private Long facultyId;
    private String facultyName;   // faculty.user.username
    private String facultyDept;   // faculty.department
    private Boolean isOpenElective;
    private Integer credits;
    private Boolean hasPublishedResults;
}
