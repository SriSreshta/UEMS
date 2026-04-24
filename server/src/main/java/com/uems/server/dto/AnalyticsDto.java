package com.uems.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDto {

    private String subjectName;

    // Pass/Fail/Absent counts
    private int pass;
    private int fail;
    private int ab;   // Absent — not counted as fail

    // Grade breakdown
    private int O;
    private int Aplus;
    private int A;
    private int Bplus;
    private int B;
    private int C;
    private int F;
}
