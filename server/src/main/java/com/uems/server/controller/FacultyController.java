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
import org.springframework.beans.factory.annotation.Value;
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
                    c.getIsOpenElective()
            )).collect(Collectors.toList());
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(403).body("Access denied: " + e.getMessage());
        }
    }

    @GetMapping("/courses/{courseId}/marks")
    public ResponseEntity<?> getCourseMarks(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long courseId) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }
            List<Enrollment> enrollments = enrollmentRepository.findByCourseCourseId(courseId);
            List<FacultyMarksResponse> response = enrollments.stream().map(e -> new FacultyMarksResponse(
                    e.getStudent().getId(),
                    e.getStudent().getRollNumber(),
                    e.getStudent().getUser() != null ? e.getStudent().getUser().getUsername() : "N/A",
                    e.getMid1Marks(),
                    e.getMid2Marks(),
                    e.getAssignmentMarks(),
                    e.getEndSemMarks(),
                    e.getEndSemReleased()
            )).collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(403).body("Access denied: " + e.getMessage());
        }
    }

    @PostMapping("/courses/{courseId}/marks/bulk")
    public ResponseEntity<?> uploadMarksBulk(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long courseId,
            @RequestBody List<MarksUpdateRequest> marksRequests) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }
            List<Enrollment> enrollments = enrollmentRepository.findByCourseCourseId(courseId);
            for (MarksUpdateRequest req : marksRequests) {
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

                enrollments.stream()
                        .filter(e -> e.getStudent().getId().equals(req.getStudentId()))
                        .findFirst()
                        .ifPresent(e -> {
                            if (req.getMid1Marks() != null) e.setMid1Marks(req.getMid1Marks());
                            if (req.getMid2Marks() != null) e.setMid2Marks(req.getMid2Marks());
                            if (req.getAssignmentMarks() != null) e.setAssignmentMarks(req.getAssignmentMarks());
                            if (req.getEndSemMarks() != null) e.setEndSemMarks(req.getEndSemMarks());
                            enrollmentRepository.save(e);
                        });
            }
            return ResponseEntity.ok("Marks uploaded successfully");
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
