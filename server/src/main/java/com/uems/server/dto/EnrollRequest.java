package com.uems.server.dto;

import lombok.Data;

@Data
public class EnrollRequest {
    private Long studentId;
    private Long courseId;
}
