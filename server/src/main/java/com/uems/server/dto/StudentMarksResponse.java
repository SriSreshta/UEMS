package com.uems.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentMarksResponse {
    private Long courseId;
    private String courseName;
    private String courseCode;
    private Integer mid1Marks;
    private Integer mid2Marks;
    private Integer assignmentMarks;
    private Integer endSemMarks;
}
