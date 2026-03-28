package com.uems.server.dto;

import lombok.Data;

@Data
public class DeptAnalyticsDto {
    private String department;
    private int studentCount;
    private int pass;
    private int fail;
    private double passPercent;
}