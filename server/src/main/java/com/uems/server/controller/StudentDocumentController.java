package com.uems.server.controller;

import com.uems.server.dto.StudentDocumentResponse;
import com.uems.server.model.Student;
import com.uems.server.model.StudentDocument;
import com.uems.server.repository.StudentDocumentRepository;
import com.uems.server.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/student/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class StudentDocumentController {

    private final StudentDocumentRepository studentDocumentRepository;
    private final StudentRepository studentRepository;

    @PostMapping("/{studentId}")
    public ResponseEntity<?> uploadDocument(
            @PathVariable Long studentId,
            @RequestParam("title") String title,
            @RequestParam("type") String type, // "document" or "certificate"
            @RequestParam("file") MultipartFile file) {

        try {
            Optional<Student> studentOpt = studentRepository.findById(studentId);
            if (studentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student not found");
            }

            StudentDocument document = StudentDocument.builder()
                    .student(studentOpt.get())
                    .title(title)
                    .fileName(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .type(type)
                    .data(file.getBytes())
                    .uploadedAt(LocalDateTime.now())
                    .build();

            studentDocumentRepository.save(document);

            return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(document));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file");
        }
    }

    @GetMapping("/{studentId}")
    public ResponseEntity<List<StudentDocumentResponse>> getDocuments(
            @PathVariable Long studentId,
            @RequestParam("type") String type) {

        List<StudentDocument> documents = studentDocumentRepository
                .findByStudentIdAndTypeOrderByUploadedAtDesc(studentId, type);

        List<StudentDocumentResponse> response = documents.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/download/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) {
        Optional<StudentDocument> docOpt = studentDocumentRepository.findById(id);
        if (docOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        StudentDocument document = docOpt.get();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(document.getFileType() != null ? document.getFileType() : "application/octet-stream"))
                .body(document.getData());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        if (!studentDocumentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        studentDocumentRepository.deleteById(id);
        return ResponseEntity.ok().body("Document deleted successfully");
    }

    private StudentDocumentResponse mapToResponse(StudentDocument doc) {
        return StudentDocumentResponse.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .fileName(doc.getFileName())
                .fileType(doc.getFileType())
                .fileSize(doc.getFileSize())
                .type(doc.getType())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }
}
