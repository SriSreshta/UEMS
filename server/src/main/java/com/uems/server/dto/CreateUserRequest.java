package com.uems.server.dto;

import lombok.Data;

@Data
public class CreateUserRequest {
    // Base fields
    private String username;
    private String email;
    private String role; // "student" or "faculty"

    // Student fields
    private String rollNumber;
    private String year;
    private String semester;

    // Faculty fields
    private String department;
    private String designation;
    private String facultyCode;
}
