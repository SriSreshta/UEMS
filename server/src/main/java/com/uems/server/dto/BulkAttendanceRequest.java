package com.uems.server.dto;

import lombok.Data;
import java.util.List;

@Data
public class BulkAttendanceRequest {
    private Long courseId;
    private Long facultyId;
    private String date; // Format: YYYY-MM-DD
    private List<AttendanceItem> attendanceList;

    @Data
    public static class AttendanceItem {
        private Long studentId;
        private boolean present;
    }
}
