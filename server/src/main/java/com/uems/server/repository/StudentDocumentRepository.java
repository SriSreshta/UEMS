package com.uems.server.repository;

import com.uems.server.model.StudentDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentDocumentRepository extends JpaRepository<StudentDocument, Long> {
    List<StudentDocument> findByStudentIdAndTypeOrderByUploadedAtDesc(Long studentId, String type);
}
