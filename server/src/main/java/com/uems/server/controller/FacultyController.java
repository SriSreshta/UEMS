package com.uems.server.controller;

import com.uems.server.model.Course;
import com.uems.server.model.User;
import com.uems.server.model.Material;
import com.uems.server.repository.CourseRepository;
import com.uems.server.repository.UserRepository;
import com.uems.server.repository.MaterialRepository;
import com.uems.server.security.JwtService;
import com.uems.server.dto.MaterialRequest;
import com.uems.server.dto.MaterialResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import com.uems.server.dto.AnalyticsDto;
import com.uems.server.model.Faculty;
import com.uems.server.repository.FacultyRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;

import java.util.List;
import java.util.stream.Collectors;
import com.uems.server.repository.EnrollmentRepository;
import com.uems.server.model.Enrollment;
import com.uems.server.dto.FacultyMarksResponse;
import com.uems.server.dto.MarksUpdateRequest;
import com.uems.server.dto.CourseResponse;
import com.uems.server.service.CourseService;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/faculty")
@PreAuthorize("hasRole('FACULTY')")

public class FacultyController {

    @Autowired private CourseRepository courseRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private JwtService jwtService;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private MaterialRepository materialRepository;
    @Autowired private CourseService courseService;
    @Autowired private FacultyRepository facultyRepository;
    @Autowired private com.uems.server.repository.ExamRepository examRepository;
    @Autowired private com.uems.server.repository.SupplementaryAttemptRepository supplementaryAttemptRepository;

    private static final String UPLOAD_DIR = "uploads/materials";

    @PostMapping("/materials/upload")
    public ResponseEntity<?> uploadMaterialFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        try {
            // Create directory if it doesn't exist
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // Generate unique filename
            String originalFileName = file.getOriginalFilename();
            String extension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + extension;
            Path path = Paths.get(UPLOAD_DIR, fileName);

            // Save file
            Files.write(path, file.getBytes());

            // Return accessible URL
            String fileUrl = "http://localhost:8081/uploads/materials/" + fileName;
            return ResponseEntity.ok(Map.of("url", fileUrl));

        } catch (IOException e) {
            return ResponseEntity.status(500).body("Could not upload file: " + e.getMessage());
        }
    }

    // ✅ Automatically get logged-in faculty's courses (JWT subject = email)
    @GetMapping("/courses")
    public ResponseEntity<?> getFacultyCourses(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }
            // Extract email from token (JWT subject is now email)
            String token = authHeader.substring(7);
            String email = jwtService.extractUsername(token);

            // Find user by email
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
            String username = user.getUsername();

            // Use courseService with email-based lookup
            List<Course> coursesList = courseService.getCoursesByFacultyEmail(email);
            
            // Map to safe DTO
            List<CourseResponse> response = coursesList.stream().map(c -> new CourseResponse(
                    c.getCourseId(), c.getName(), c.getCode(), c.getDepartment(), 
                    c.getYear(), c.getSemester(), 
                    c.getFaculty() != null ? c.getFaculty().getId() : null, 
                    username, 
                    c.getFaculty() != null ? c.getFaculty().getDepartment() : null,
                    c.getIsOpenElective(),
                    c.getCredits(),
                    false
            )).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(403).body("Access denied: " + e.getMessage());
        }
    }

    @GetMapping("/exams")
    public ResponseEntity<?> getExams() {
        try {
            List<com.uems.server.dto.ExamDto> exams = examRepository.findAll().stream().map(e -> {
                com.uems.server.dto.ExamDto dto = new com.uems.server.dto.ExamDto();
                dto.setExamId(e.getExamId());
                dto.setTitle(e.getTitle());
                dto.setYear(e.getYear());
                dto.setSemester(e.getSemester());
                dto.setExamType(e.getExamType());
                dto.setCreatedAt(e.getCreatedAt());
                return dto;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(exams);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching exams: " + e.getMessage());
        }
    }

    @GetMapping("/courses/{courseId}/marks")
    public ResponseEntity<?> getCourseMarks(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long courseId,
            @RequestParam(required = false) Long examId) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }

            boolean isSupplementary = false;
            if (examId != null) {
                com.uems.server.model.Exam exam = examRepository.findById(examId)
                        .orElseThrow(() -> new RuntimeException("Exam not found"));
                isSupplementary = "SUPPLEMENTARY".equalsIgnoreCase(exam.getExamType());
            }

            if (isSupplementary) {
                // For supplementary, we only show students who have failed or were absent in previous attempts
                // AND are not already passed in some other attempt (simplified: we check current Enrollment)
                List<Enrollment> eligible = enrollmentRepository.findByCourseCourseId(courseId).stream()
                        .filter(e -> "F".equals(e.getGrade()) || "Ab".equals(e.getGrade()))
                        .collect(Collectors.toList());

                List<FacultyMarksResponse> response = eligible.stream().map(e -> {
                    // Check if there's already an attempt for THIS exam session
                    var attemptOpt = supplementaryAttemptRepository.findByExamExamIdAndEnrollmentId(examId, e.getId());
                    
                    FacultyMarksResponse r = new FacultyMarksResponse();
                    r.setStudentId(e.getStudent().getId());
                    r.setRollNumber(e.getStudent().getRollNumber());
                    r.setStudentName(e.getStudent().getUser() != null ? e.getStudent().getUser().getUsername() : "N/A");
                    r.setYear(String.valueOf(e.getStudent().getYear()));
                    r.setSemester(String.valueOf(e.getStudent().getSemester()));
                    
                    if (attemptOpt.isPresent()) {
                        var a = attemptOpt.get();
                        r.setMid1Marks(a.getMid1Marks());
                        r.setMid2Marks(a.getMid2Marks());
                        r.setAssignmentMarks(a.getAssignmentMarks());
                        r.setEndSemMarks(a.getEndSemMarks());
                        r.setEndSemReleased(a.getIsReleased());
                        r.setIsAbsent(a.getIsAbsent());
                    } else {
                        // User specifically said NO carry forward
                        r.setMid1Marks(null);
                        r.setMid2Marks(null);
                        r.setAssignmentMarks(null);
                        r.setEndSemMarks(null);
                        r.setEndSemReleased(false);
                        r.setIsAbsent(false);
                    }
                    return r;
                }).collect(Collectors.toList());
                return ResponseEntity.ok(response);
            } else {
                // Regular logic
                List<Enrollment> enrollments = enrollmentRepository.findByCourseCourseId(courseId);
                List<FacultyMarksResponse> response = enrollments.stream().map(e -> new FacultyMarksResponse(
                        e.getStudent().getId(),
                        e.getStudent().getRollNumber(),
                        e.getStudent().getUser() != null ? e.getStudent().getUser().getUsername() : "N/A",
                        e.getMid1Marks(),
                        e.getMid2Marks(),
                        e.getAssignmentMarks(),
                        e.getEndSemMarks(),
                        e.getEndSemReleased(),
                        String.valueOf(e.getStudent().getYear()),
                        String.valueOf(e.getStudent().getSemester()),
                        e.getIsAbsent()
                )).collect(Collectors.toList());
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            return ResponseEntity.status(403).body("Access denied: " + e.getMessage());
        }
    }
    @PostMapping("/courses/{courseId}/marks/bulk")
    public ResponseEntity<?> uploadMarksBulk(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long courseId,
            @RequestParam(required = false) Long examId,
            @RequestBody List<MarksUpdateRequest> marksRequests) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }

            com.uems.server.model.Exam exam = null;
            boolean isSupplementary = false;
            if (examId != null) {
                exam = examRepository.findById(examId)
                        .orElseThrow(() -> new RuntimeException("Exam not found"));
                isSupplementary = "SUPPLEMENTARY".equalsIgnoreCase(exam.getExamType());
            }

            List<Enrollment> enrollments = enrollmentRepository.findByCourseCourseId(courseId);
            int updatedCount = 0;
            int skippedCount = 0;

            for (MarksUpdateRequest req : marksRequests) {
                // Validation
                if (req.getMid1Marks() != null && (req.getMid1Marks() < 0 || req.getMid1Marks() > 30)) {
                    return ResponseEntity.status(400).body("Error: Mid1 marks must be between 0 and 30");
                }
                if (req.getMid2Marks() != null && (req.getMid2Marks() < 0 || req.getMid2Marks() > 30)) {
                    return ResponseEntity.status(400).body("Error: Mid2 marks must be between 0 and 30");
                }
                if (req.getAssignmentMarks() != null && (req.getAssignmentMarks() < 0 || req.getAssignmentMarks() > 10)) {
                    return ResponseEntity.status(400).body("Error: Assignment marks must be between 0 and 10");
                }
                if (req.getEndSemMarks() != null && (req.getEndSemMarks() < 0 || req.getEndSemMarks() > 60)) {
                    return ResponseEntity.status(400).body("Error: End Sem marks must be between 0 and 60");
                }

                java.util.Optional<Enrollment> enrollmentOpt = enrollments.stream()
                        .filter(e -> e.getStudent().getId().equals(req.getStudentId()))
                        .findFirst();

                if (enrollmentOpt.isPresent()) {
                    Enrollment e = enrollmentOpt.get();

                    if (isSupplementary) {
                        // Find or create SupplementaryAttempt for this exam session
                        com.uems.server.model.SupplementaryAttempt attempt = 
                            supplementaryAttemptRepository.findByExamExamIdAndEnrollmentId(examId, e.getId())
                            .orElseGet(() -> com.uems.server.model.SupplementaryAttempt.builder()
                                .exam(examRepository.findById(examId).orElseThrow())
                                .enrollment(e)
                                .year(e.getCourse().getYear())
                                .semester(e.getCourse().getSemester())
                                .build());

                        if (Boolean.TRUE.equals(attempt.getIsReleased())) {
                            skippedCount++;
                            continue;
                        }

                        if (req.getMid1Marks() != null) attempt.setMid1Marks(req.getMid1Marks());
                        if (req.getMid2Marks() != null) attempt.setMid2Marks(req.getMid2Marks());
                        if (req.getAssignmentMarks() != null) attempt.setAssignmentMarks(req.getAssignmentMarks());
                        if (req.getEndSemMarks() != null) attempt.setEndSemMarks(req.getEndSemMarks());
                        if (req.getIsAbsent() != null) attempt.setIsAbsent(req.getIsAbsent());
                        
                        supplementaryAttemptRepository.save(attempt);
                        updatedCount++;
                    } else {
                        // Regular logic
                        if (Boolean.TRUE.equals(e.getEndSemReleased())) {
                            skippedCount++;
                            continue;
                        }
                        if (req.getMid1Marks() != null) e.setMid1Marks(req.getMid1Marks());
                        if (req.getMid2Marks() != null) e.setMid2Marks(req.getMid2Marks());
                        if (req.getAssignmentMarks() != null) e.setAssignmentMarks(req.getAssignmentMarks());
                        if (req.getEndSemMarks() != null) e.setEndSemMarks(req.getEndSemMarks());
                        if (req.getIsAbsent() != null) e.setIsAbsent(req.getIsAbsent());
                        enrollmentRepository.save(e);
                        updatedCount++;
                    }
                }
            }

            if (updatedCount == 0 && skippedCount > 0) {
                return ResponseEntity.status(409).body("Unable to save. All records are locked because results have been published for this session.");
            }

            String msg = "Marks saved successfully. Updated: " + updatedCount;
            if (skippedCount > 0) msg += ", Skipped: " + skippedCount + " (locked due to published results).";

            return ResponseEntity.ok(msg);
        } catch (Exception e) {
            return ResponseEntity.status(403).body("Access denied: " + e.getMessage());
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  STUDY MATERIALS
    // ══════════════════════════════════════════════════════════════

    @PostMapping("/courses/{courseId}/materials")
    public ResponseEntity<?> addMaterial(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long courseId,
            @RequestBody MaterialRequest req) {
        try {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            Material material = Material.builder()
                    .course(course)
                    .chapter(req.getChapter())
                    .title(req.getTitle())
                    .type(req.getType())
                    .fileUrl(req.getFileUrl())
                    .description(req.getDescription())
                    .build();
            materialRepository.save(material);
            return ResponseEntity.ok("Material added successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/courses/{courseId}/materials")
    public ResponseEntity<?> getMaterials(@PathVariable Long courseId) {
        List<Material> materials = materialRepository.findByCourseCourseIdOrderByChapterAsc(courseId);
        List<MaterialResponse> response = materials.stream().map(m -> new MaterialResponse(
                m.getId(), m.getChapter(), m.getTitle(), m.getType(), m.getFileUrl(), m.getDescription(),
                m.getCourse().getCourseId(), m.getCourse().getName()
        )).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/materials/{id}")
    public ResponseEntity<?> deleteMaterial(@PathVariable Long id) {
        if (!materialRepository.existsById(id)) return ResponseEntity.notFound().build();
        materialRepository.deleteById(id);
        return ResponseEntity.ok("Material deleted");
    }

    @GetMapping("/analytics")
    public ResponseEntity<List<AnalyticsDto>> getFacultyAnalytics(
            @RequestParam Integer year,
            @RequestParam Integer semester,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // userDetails.getUsername() now returns email (Spring Security principal = email)
            String email = userDetails.getUsername();
            Faculty faculty = facultyRepository.findByUserEmail(email)
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));

            List<Enrollment> enrollments = enrollmentRepository
                    .findByCourseYearAndCourseSemesterAndCourseFacultyId(
                        year, String.valueOf(semester), faculty.getId());

            Map<String, List<Enrollment>> bySubject = new LinkedHashMap<>();
            for (Enrollment e : enrollments) {
                String name = e.getCourse().getName();
                bySubject.computeIfAbsent(name, k -> new ArrayList<>()).add(e);
            }

            List<AnalyticsDto> result = new ArrayList<>();
            for (Map.Entry<String, List<Enrollment>> entry : bySubject.entrySet()) {
                AnalyticsDto dto = new AnalyticsDto();
                dto.setSubjectName(entry.getKey());
                for (Enrollment e : entry.getValue()) {
                    String grade = e.getGrade();
                    if (grade == null) continue;
                    switch (grade) {
                        case "O"  -> { dto.setO(dto.getO() + 1);         dto.setPass(dto.getPass() + 1); }
                        case "A+" -> { dto.setAplus(dto.getAplus() + 1); dto.setPass(dto.getPass() + 1); }
                        case "A"  -> { dto.setA(dto.getA() + 1);         dto.setPass(dto.getPass() + 1); }
                        case "B+" -> { dto.setBplus(dto.getBplus() + 1); dto.setPass(dto.getPass() + 1); }
                        case "B"  -> { dto.setB(dto.getB() + 1);         dto.setPass(dto.getPass() + 1); }
                        case "C"  -> { dto.setC(dto.getC() + 1);         dto.setPass(dto.getPass() + 1); }
                        case "F"  -> { dto.setF(dto.getF() + 1);         dto.setFail(dto.getFail() + 1); }
                        case "Ab" -> dto.setAb(dto.getAb() + 1);
                        default   -> dto.setFail(dto.getFail() + 1);
                    }
                }
                result.add(dto);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}
