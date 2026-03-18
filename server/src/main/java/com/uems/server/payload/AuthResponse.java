package com.uems.server.payload;

public class AuthResponse {
    private String token;
    private String role;
    private String username;
    private Long facultyId; // Nullable for non-faculty

    public AuthResponse(String token, String role, String username, Long facultyId) {
        this.token = token;
        this.role = role;
        this.username = username;
        this.facultyId = facultyId;
    }

    // Getters and setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }
}
