package com.uems.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseResultDto {
    private String courseCode;
    private String courseName;
    private Integer credits;
    private String grade;
    private Integer gradePoints;
}
