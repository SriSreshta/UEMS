package com.uems.server.dto;

import lombok.Data;

@Data
public class MaterialRequest {
    private Long courseId;
    private String chapter;
    private String title;
    private String type;      // VIDEO, BOOK, ARTICLE
    private String fileUrl;
    private String description;
}
