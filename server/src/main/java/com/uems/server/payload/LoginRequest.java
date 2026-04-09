package com.uems.server.payload;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class LoginRequest {
    private String username;
    private String password;
    private String rollNumber;   // For Students
    private String facultyCode;  // For Faculty
    private String role;         // "student", "faculty", "admin"
}
