package com.uems.server.dto;

import lombok.Data;
import java.util.List;

@Data
public class ExamScheduleRequest {
    private List<ExamScheduleDto> schedules;
}
