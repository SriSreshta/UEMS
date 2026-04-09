package com.uems.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String rollNumber; // for students
    private String department;
    private String designation; // for faculty
    private String year; // for students
    private String semester; // for students
    private String facultyCode; // for faculty
}
