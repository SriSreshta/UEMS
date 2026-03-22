package com.uems.server.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class FeeNotificationRequest {
    private String title;
    private Double baseAmount;
    private LocalDate dueDate;
    private Double lateFeePerWeek;
    private String targetYear;
    private String targetSemester;
}
