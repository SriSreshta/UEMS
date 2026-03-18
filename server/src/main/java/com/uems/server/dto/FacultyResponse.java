package com.uems.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Safe DTO for returning Faculty list without recursion (avoids serializing Course list).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacultyResponse {
    private Long id;
    private String username;   // faculty.user.username
    private String email;      // faculty.user.email
    private String department;
    private String designation;
}
