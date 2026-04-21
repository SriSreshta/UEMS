package com.uems.server.payload;

public class AuthResponse {
    private String token;
    private String role;
    private String username;
    private Long facultyId;      // Nullable for non-faculty
    private Long studentId;      // Nullable for non-student
    private String facultyCode;  // Nullable for non-faculty
    private String year;
    private String semester;

    public AuthResponse(String token, String role, String username, Long facultyId, Long studentId, String facultyCode, String year, String semester) {
        this.token = token;
        this.role = role;
        this.username = username;
        this.facultyId = facultyId;
        this.studentId = studentId;
        this.facultyCode = facultyCode;
        this.year = year;
        this.semester = semester;
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

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getFacultyCode() { return facultyCode; }
    public void setFacultyCode(String facultyCode) { this.facultyCode = facultyCode; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
}
