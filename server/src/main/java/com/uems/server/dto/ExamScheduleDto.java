package com.uems.server.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ExamScheduleDto {
    private Long scheduleId;
    private Long examId;
    private String examTitle;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private LocalDate examDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isBroadcasted;
}
