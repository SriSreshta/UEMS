package com.uems.server.dto;

import lombok.Data;

@Data
public class UpdateStudentRequest {
    private String username;
    private String email;
    private String year;
    private String semester;
    private String department;
    private String section;
    private boolean resetCurrentSemesterEnrollments;
}
