package com.uems.server.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDocumentResponse {
    private Long id;
    private String title;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String type;
    private LocalDateTime uploadedAt;
}
