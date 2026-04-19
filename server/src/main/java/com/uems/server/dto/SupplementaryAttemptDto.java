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
    private Long studentId;
    private Long enrollmentId; // So UI can map to the attempt later if needed
    private String rollNumber;
    private String studentName;
    private Integer year;
    private String semester;
    private Integer marksObtained;
    private String grade;
    private String status;
}
