package com.uems.server.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SemesterResultDto {
    private Integer year;
    private String semester;
    private Double sgpa;
    private List<CourseResultDto> courses;
}
