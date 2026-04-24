package com.uems.server.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ExamDto {
    private Long examId;
    private String title;
    private Integer year;
    private Integer semester;
    private String examType;
    private LocalDateTime createdAt;
}
