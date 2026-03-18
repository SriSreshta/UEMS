package com.uems.server.dto;

import lombok.Data;
import java.util.List;

@Data
public class BulkEnrollRequest {
    private List<Long> studentIds;
    private Long courseId;
}
