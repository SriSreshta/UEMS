package com.uems.server.dto;

import lombok.Data;

@Data
public class AssignFacultyRequest {
    private Long courseId;
    private Long facultyId;
}
