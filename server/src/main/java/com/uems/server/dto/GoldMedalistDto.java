package com.uems.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoldMedalistDto {
    private Long studentId;
    private String rollNumber;
    private String username;
    private String department;
    private Double cgpa;
    private Integer totalCredits;
}
