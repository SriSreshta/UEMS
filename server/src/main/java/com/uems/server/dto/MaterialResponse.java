package com.uems.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MaterialResponse {
    private Long id;
    private String chapter;
    private String title;
    private String type;
    private String fileUrl;
    private String description;
    private Long courseId;
    private String courseName;
}
