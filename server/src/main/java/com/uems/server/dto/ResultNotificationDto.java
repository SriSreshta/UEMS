package com.uems.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultNotificationDto {
    private Long id;
    private Long examId;
    private String examTitle;
    private Integer year;
    private String semester;
    private Boolean isSeen;
    private LocalDateTime createdAt;
}
