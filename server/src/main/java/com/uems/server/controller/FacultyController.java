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

import java.util.List;
import java.util.stream.Collectors;
import com.uems.server.repository.EnrollmentRepository;
import com.uems.server.model.Enrollment;
import com.uems.server.dto.FacultyMarksResponse;
import com.uems.server.dto.MarksUpdateRequest;

@RestController
@RequestMapping("/faculty")

public class FacultyController {

    @Autowired private CourseRepository courseRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private JwtService jwtService;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private MaterialRepository materialRepository;

    // ✅ Automatically get logged-in faculty’s courses
    @GetMapping("/courses")
    public ResponseEntity<?> getFacultyCourses(@RequestHeader("Authorization") String authHeader) {
        System.out.println("🎯 Faculty endpoint hit!");
        System.out.println("Header received: " + authHeader);
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }
            // Extract username from token
            String token = authHeader.substring(7);
            String username = jwtService.extractUsername(token);
System.out.println("extracted username"+username);
            // Find faculty
            User faculty = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));
System.out.println("faculty id"+faculty.getId());
            // Fetch faculty’s courses
            List<Course> courses = courseRepository.findByFacultyId(faculty.getId());
              System.out.println("✅ Courses found: " + courses.size());
              return ResponseEntity.ok(courses);

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
                    e.getAssignmentMarks()
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
                enrollments.stream()
                        .filter(e -> e.getStudent().getId().equals(req.getStudentId()))
                        .findFirst()
                        .ifPresent(e -> {
                            if (req.getMid1Marks() != null) e.setMid1Marks(req.getMid1Marks());
                            if (req.getMid2Marks() != null) e.setMid2Marks(req.getMid2Marks());
                            if (req.getAssignmentMarks() != null) e.setAssignmentMarks(req.getAssignmentMarks());
                            enrollmentRepository.save(e);
                        });
            }
            return ResponseEntity.ok("Marks uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.status(403).body("Access denied: " + e.getMessage());
        }
    }

    // ══════════════════════════════════════════════════════════
    //  STUDY MATERIALS
    // ══════════════════════════════════════════════════════════

    /** POST /faculty/courses/{courseId}/materials — add a resource link */
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

    /** GET /faculty/courses/{courseId}/materials — list resources for a course */
    @GetMapping("/courses/{courseId}/materials")
    public ResponseEntity<?> getMaterials(@PathVariable Long courseId) {
        List<Material> materials = materialRepository.findByCourseCourseIdOrderByChapterAsc(courseId);
        List<MaterialResponse> response = materials.stream().map(m -> new MaterialResponse(
                m.getId(), m.getChapter(), m.getTitle(), m.getType(), m.getFileUrl(), m.getDescription(),
                m.getCourse().getCourseId(), m.getCourse().getName()
        )).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /** DELETE /faculty/materials/{id} — remove a resource */
    @DeleteMapping("/materials/{id}")
    public ResponseEntity<?> deleteMaterial(@PathVariable Long id) {
        if (!materialRepository.existsById(id)) return ResponseEntity.notFound().build();
        materialRepository.deleteById(id);
        return ResponseEntity.ok("Material deleted");
    }
}
