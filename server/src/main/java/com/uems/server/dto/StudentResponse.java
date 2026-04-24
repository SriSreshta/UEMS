package com.uems.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Safe DTO for returning Student data in lists (avoids exposing User entity directly).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {
    private Long id;
    private String username;
    private String email;
    private String rollNumber;
    private String year;
    private String semester;
    private String department;
}
