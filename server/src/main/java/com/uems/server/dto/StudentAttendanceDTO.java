package com.uems.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAttendanceDTO {
    private Long courseId;
    private String courseCode;
    private String courseName;
    private Long totalClasses;
    private Long attendedClasses;
    private Double percentage;
    private String semester;
    private Integer year;
}
