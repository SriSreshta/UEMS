package com.uems.server.dto;

import lombok.Data;
import java.util.List;

@Data
public class PublishResultsRequest {
    private List<StudentResultPreviewDto> students;
}
