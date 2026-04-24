package com.uems.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacultyMarksResponse {
    private Long studentId;
    private String rollNumber;
    private String studentName;
    private Integer mid1Marks;
    private Integer mid2Marks;
    private Integer assignmentMarks;
    private Integer endSemMarks;
    private Boolean endSemReleased;
    private String year;
    private String semester;
}
