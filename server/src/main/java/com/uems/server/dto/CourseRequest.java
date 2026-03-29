package com.uems.server.dto;

import lombok.Data;

@Data
public class CourseRequest {
    private String name;
    private String code;
    private String department;
    private Integer year;
    private String semester;
    private Boolean isOpenElective;
}
