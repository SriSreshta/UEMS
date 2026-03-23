package com.uems.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResultPreviewDto {
    private Long studentId;
    private String hallTicketNo;
    private String studentName;
    private String sgpa; // Computed SGPA as string or formatted double
    
    private List<CourseResultDto> courses;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseResultDto {
        private Long enrollmentId;
        private Long courseId;
        private String courseCode;
        private String courseName;
        private Integer credits;
        
        private Integer mid1;
        private Integer mid2;
        private Integer assignment;
        private Integer endSem;
        
        // Computed/Preview fields
        private Integer internalMarks;
        private Integer totalMarks;
        private String grade;
        private Integer gradePoints;
        private Boolean isAbsent;
    }
}
