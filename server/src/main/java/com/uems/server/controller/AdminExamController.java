package com.uems.server.controller;

import com.uems.server.dto.*;
import com.uems.server.model.Course;
import com.uems.server.model.Enrollment;
import com.uems.server.model.Exam;
import com.uems.server.model.ExamSchedule;
import com.uems.server.model.SupplementaryAttempt;
import com.uems.server.repository.CourseRepository;
import com.uems.server.repository.EnrollmentRepository;
import com.uems.server.repository.ExamRepository;
import com.uems.server.repository.ExamScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
@RestController
@RequestMapping("/api/admin/exams")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@PreAuthorize("hasRole('ADMIN')")
public class AdminExamController {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ExamScheduleRepository examScheduleRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private com.uems.server.repository.ResultNotificationRepository resultNotificationRepository;

    @Autowired
    private com.uems.server.repository.SupplementaryAttemptRepository supplementaryAttemptRepository;

    @Autowired
    private com.uems.server.repository.StudentRepository studentRepository;

    @Autowired
    private com.uems.server.service.AdminService adminService;

    @PersistenceContext
    private EntityManager entityManager;

    // --- 1. EXAM CREATION ---

    @PostMapping
    public ExamDto createExam(@RequestBody ExamDto dto) {
        Exam exam = Exam.builder()
                .title(dto.getTitle())
                .year(dto.getYear())
                .semester(dto.getSemester())
                .examType(dto.getExamType())
                .createdAt(LocalDateTime.now())
                .build();
        exam = examRepository.save(exam);
        dto.setExamId(exam.getExamId());
        dto.setCreatedAt(exam.getCreatedAt());
        return dto;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACULTY') or hasRole('STUDENT')")
    public List<ExamDto> listExams() {
        return examRepository.findAll().stream().map(e -> {
            ExamDto dto = new ExamDto();
            dto.setExamId(e.getExamId());
            dto.setTitle(e.getTitle());
            dto.setYear(e.getYear());
            dto.setSemester(e.getSemester());
            dto.setExamType(e.getExamType());
            dto.setCreatedAt(e.getCreatedAt());
            return dto;
        }).collect(Collectors.toList());
    }

    // --- 2. EXAM SCHEDULES ---

    @GetMapping("/{examId}/schedules")
    public List<ExamScheduleDto> getSchedules(@PathVariable Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        List<ExamSchedule> existing = examScheduleRepository.findByExamExamId(examId);

        if (existing.isEmpty()) {
            List<Course> courses = courseRepository.findByYearAndSemester(exam.getYear(), String.valueOf(exam.getSemester()));
            return courses.stream().map(c -> {
                ExamScheduleDto dto = new ExamScheduleDto();
                dto.setCourseId(c.getCourseId());
                dto.setCourseCode(c.getCode());
                dto.setCourseName(c.getName());
                dto.setIsBroadcasted(false);
                return dto;
            }).collect(Collectors.toList());
        }

        return existing.stream().map(s -> {
            ExamScheduleDto dto = new ExamScheduleDto();
            dto.setScheduleId(s.getScheduleId());
            dto.setCourseId(s.getCourse().getCourseId());
            dto.setCourseCode(s.getCourse().getCode());
            dto.setCourseName(s.getCourse().getName());
            dto.setExamDate(s.getExamDate());
            dto.setStartTime(s.getStartTime());
            dto.setEndTime(s.getEndTime());
            dto.setIsBroadcasted(s.getIsBroadcasted());
            return dto;
        }).collect(Collectors.toList());
    }

    @PostMapping("/{examId}/schedules")
    public void saveSchedules(@PathVariable Long examId, @RequestBody ExamScheduleRequest req) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        
        List<ExamSchedule> existing = examScheduleRepository.findByExamExamId(examId);

        for (ExamScheduleDto dto : req.getSchedules()) {
            ExamSchedule schedule = existing.stream()
                    .filter(s -> s.getCourse().getCourseId().equals(dto.getCourseId()))
                    .findFirst()
                    .orElseGet(() -> {
                        ExamSchedule s = new ExamSchedule();
                        s.setExam(exam);
                        s.setCourse(courseRepository.findById(dto.getCourseId()).orElseThrow());
                        s.setIsBroadcasted(false);
                        return s;
                    });

            schedule.setExamDate(dto.getExamDate());
            schedule.setStartTime(dto.getStartTime());
            schedule.setEndTime(dto.getEndTime());
            examScheduleRepository.save(schedule);
        }
    }

    @PutMapping("/{examId}/broadcast")
    @Transactional
    public void broadcastSchedule(@PathVariable Long examId) {
        List<ExamSchedule> schedules = examScheduleRepository.findByExamExamId(examId);
        schedules.forEach(s -> s.setIsBroadcasted(true));
        examScheduleRepository.saveAll(schedules);
    }

    // --- 3. PUBLISH RESULTS ---

    @GetMapping("/{examId}/results/preview")
    public List<StudentResultPreviewDto> previewResults(@PathVariable Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        boolean isSupplementary = "SUPPLEMENTARY".equalsIgnoreCase(exam.getExamType());

        if (isSupplementary) {
            List<com.uems.server.model.SupplementaryAttempt> attempts = supplementaryAttemptRepository.findByExamExamId(examId);
            
            // Group by student
            Map<Long, List<com.uems.server.model.SupplementaryAttempt>> studentGroups = attempts.stream()
                    .collect(Collectors.groupingBy(a -> a.getEnrollment().getStudent().getId()));

            List<StudentResultPreviewDto> results = new ArrayList<>();
            for (Map.Entry<Long, List<com.uems.server.model.SupplementaryAttempt>> entry : studentGroups.entrySet()) {
                StudentResultPreviewDto sDto = new StudentResultPreviewDto();
                sDto.setStudentId(entry.getKey());
                var firstAttempt = entry.getValue().get(0);
                sDto.setHallTicketNo(firstAttempt.getEnrollment().getStudent().getRollNumber());
                sDto.setStudentName(firstAttempt.getEnrollment().getStudent().getUser().getUsername());

                List<StudentResultPreviewDto.CourseResultDto> courseDtos = new ArrayList<>();
                for (var a : entry.getValue()) {
                    StudentResultPreviewDto.CourseResultDto cDto = new StudentResultPreviewDto.CourseResultDto();
                    cDto.setEnrollmentId(a.getEnrollment().getId());
                    cDto.setCourseId(a.getEnrollment().getCourse().getCourseId());
                    cDto.setCourseCode(a.getEnrollment().getCourse().getCode());
                    cDto.setCourseName(a.getEnrollment().getCourse().getName());
                    cDto.setCredits(a.getEnrollment().getCourse().getCredits() != null ? a.getEnrollment().getCourse().getCredits() : 0);
                    
                    cDto.setMid1(a.getMid1Marks());
                    cDto.setMid2(a.getMid2Marks());
                    cDto.setAssignment(a.getAssignmentMarks());
                    cDto.setEndSem(a.getEndSemMarks());
                    cDto.setIsAbsent(a.getIsAbsent() != null && a.getIsAbsent());

                    calculateGrades(cDto);
                    courseDtos.add(cDto);
                }
                sDto.setCourses(courseDtos);
                // SGPA calculation for supplementary might be different since it's only a few subjects, 
                // but we can show it for the subjects being attempted.
                results.add(sDto);
            }
            return results;
        } else {
            // Regular logic
            List<Course> courses = courseRepository.findByYearAndSemester(exam.getYear(), String.valueOf(exam.getSemester()));
            List<Long> courseIds = courses.stream().map(Course::getCourseId).collect(Collectors.toList());
            List<Enrollment> enrollments = enrollmentRepository.findByCourseCourseIdIn(courseIds);

            Map<Long, List<Enrollment>> studentGroups = enrollments.stream()
                    .collect(Collectors.groupingBy(e -> e.getStudent().getId()));

            List<StudentResultPreviewDto> results = new ArrayList<>();
            for (Map.Entry<Long, List<Enrollment>> entry : studentGroups.entrySet()) {
                StudentResultPreviewDto sDto = new StudentResultPreviewDto();
                sDto.setStudentId(entry.getKey());
                sDto.setHallTicketNo(entry.getValue().get(0).getStudent().getRollNumber());
                sDto.setStudentName(entry.getValue().get(0).getStudent().getUser().getUsername());

                List<StudentResultPreviewDto.CourseResultDto> courseDtos = new ArrayList<>();
                for (Enrollment e : entry.getValue()) {
                    StudentResultPreviewDto.CourseResultDto cDto = new StudentResultPreviewDto.CourseResultDto();
                    cDto.setEnrollmentId(e.getId());
                    cDto.setCourseId(e.getCourse().getCourseId());
                    cDto.setCourseCode(e.getCourse().getCode());
                    cDto.setCourseName(e.getCourse().getName());
                    cDto.setCredits(e.getCourse().getCredits() != null ? e.getCourse().getCredits() : 0);
                    cDto.setMid1(e.getMid1Marks());
                    cDto.setMid1(e.getMid1Marks());
                    cDto.setMid2(e.getMid2Marks());
                    cDto.setAssignment(e.getAssignmentMarks());
                    cDto.setEndSem(e.getEndSemMarks());
                    cDto.setIsAbsent(e.getIsAbsent() != null && e.getIsAbsent());
                    calculateGrades(cDto);
                    courseDtos.add(cDto);
                }
                sDto.setCourses(courseDtos);
                results.add(sDto);
            }
            return results;
        }
    }

    private void calculateGrades(StudentResultPreviewDto.CourseResultDto cDto) {
        if (Boolean.TRUE.equals(cDto.getIsAbsent())) {
            cDto.setInternalMarks(0);
            cDto.setTotalMarks(0);
            cDto.setGrade("Ab");
            cDto.setGradePoints(0);
            return;
        }

        double m1 = cDto.getMid1() != null ? cDto.getMid1() : 0;
        double m2 = cDto.getMid2() != null ? cDto.getMid2() : 0;
        int assign = cDto.getAssignment() != null ? cDto.getAssignment() : 0;
        int endSem = cDto.getEndSem() != null ? cDto.getEndSem() : 0;

        int internal = (int) Math.ceil((m1 + m2) / 2.0) + assign;
        cDto.setInternalMarks(internal);

        if (internal < 14 || endSem < 21) {
            cDto.setTotalMarks(internal + endSem);
            cDto.setGrade("F");
            cDto.setGradePoints(0);
            return;
        }

        int total = internal + endSem;
        cDto.setTotalMarks(total);

        if (total >= 90) { cDto.setGrade("O"); cDto.setGradePoints(10); }
        else if (total >= 80) { cDto.setGrade("A+"); cDto.setGradePoints(9); }
        else if (total >= 70) { cDto.setGrade("A"); cDto.setGradePoints(8); }
        else if (total >= 60) { cDto.setGrade("B+"); cDto.setGradePoints(7); }
        else if (total >= 50) { cDto.setGrade("B"); cDto.setGradePoints(6); }
        else if (total >= 40) { cDto.setGrade("C"); cDto.setGradePoints(5); }
        else { cDto.setGrade("F"); cDto.setGradePoints(0); }
    }

    @PostMapping("/{examId}/results/publish")
    @Transactional
    public void publishResults(@PathVariable Long examId, @RequestBody PublishResultsRequest req) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        boolean isSupplementary = "SUPPLEMENTARY".equalsIgnoreCase(exam.getExamType());

        for (StudentResultPreviewDto sDto : req.getStudents()) {
            for (StudentResultPreviewDto.CourseResultDto cDto : sDto.getCourses()) {
                if (isSupplementary) {
                    var attempt = supplementaryAttemptRepository.findByExamExamIdAndEnrollmentId(examId, cDto.getEnrollmentId())
                            .orElseThrow(() -> new RuntimeException("Supplementary attempt not found for enrollment " + cDto.getEnrollmentId()));
                    
                    attempt.setIsAbsent(cDto.getIsAbsent());
                    attempt.setGrade(cDto.getGrade());
                    attempt.setGradePoints(cDto.getGradePoints());
                    attempt.setTotalMarks(cDto.getTotalMarks());
                    attempt.setIsReleased(true);
                    supplementaryAttemptRepository.save(attempt);

                    // If student PASSES supplementary, we ALSO update the main Enrollment table
                    // so that the student is no longer considered to have a backlog in current view.
                    if (!"F".equals(cDto.getGrade()) && !"Ab".equals(cDto.getGrade())) {
                        Enrollment e = enrollmentRepository.findById(cDto.getEnrollmentId()).orElseThrow();
                        e.setMid1Marks(cDto.getMid1());
                        e.setMid2Marks(cDto.getMid2());
                        e.setAssignmentMarks(cDto.getAssignment());
                        e.setEndSemMarks(cDto.getEndSem());
                        e.setGrade(cDto.getGrade());
                        e.setGradePoints(cDto.getGradePoints());
                        e.setTotalMarks(cDto.getTotalMarks());
                        e.setIsAbsent(cDto.getIsAbsent());
                        // e.setEndSemReleased(true); // Technically already released for regular, but we update the final grade
                        enrollmentRepository.save(e);
                    }
                } else {
                    Enrollment e = enrollmentRepository.findById(cDto.getEnrollmentId()).orElseThrow();
                    e.setIsAbsent(cDto.getIsAbsent());
                    e.setGrade(cDto.getGrade());
                    e.setGradePoints(cDto.getGradePoints());
                    e.setTotalMarks(cDto.getTotalMarks());
                    e.setEndSemReleased(true);
                    enrollmentRepository.save(e);
                }
            }
        }
        
        // Trigger notifications automatically after publishing
        Set<Long> publishedStudentIds = req.getStudents().stream()
                .map(StudentResultPreviewDto::getStudentId)
                .collect(Collectors.toSet());
        notifyResultsPublished(examId, publishedStudentIds);
    }

    @PostMapping("/{examId}/results/unpublish")
    @Transactional
    public void unpublishResults(@PathVariable Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        if (exam.getExamType().toUpperCase().equals("SUPPLEMENTARY")) {
            List<SupplementaryAttempt> attempts = supplementaryAttemptRepository.findByExamExamId(examId);
            for (SupplementaryAttempt a : attempts) {
                a.setIsReleased(false);
                supplementaryAttemptRepository.save(a);
            }
        } else {
            List<Course> courses = courseRepository.findByYearAndSemester(exam.getYear(), String.valueOf(exam.getSemester()));
            List<Long> courseIds = courses.stream().map(Course::getCourseId).collect(Collectors.toList());

            List<Enrollment> enrollments = enrollmentRepository.findByCourseCourseIdIn(courseIds);
            for (Enrollment e : enrollments) {
                e.setEndSemReleased(false);
                enrollmentRepository.save(e);
            }
        }

        // Delete associated notifications so they can be re-triggered later
        resultNotificationRepository.deleteByExamExamId(examId);
        System.out.println("DEBUG: Results unpublished and notifications removed for Exam: " + exam.getTitle());
    }

    @PostMapping("/system-final-reset")
    @Transactional
    public void systemFinalReset() {
        adminService.performSystemAcademicReset();
        System.out.println("DEBUG: SYSTEM GLOBAL ACADEMIC RESET PERFORMED.");
    }


    @PostMapping("/sync-credits-only")
    @Transactional
    public void syncCreditsOnly() {
        adminService.syncAllSystemCredits();
        System.out.println("DEBUG: SYSTEM GLOBAL CREDIT SYNC PERFORMED (Marks Preserved).");
    }

    @PostMapping("/{examId}/notify")
    @Transactional
    public void notifyResultsPublished(@PathVariable Long examId, @RequestBody(required = false) Set<Long> specificStudentIds) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        String semStr = String.valueOf(exam.getSemester());
        System.out.println("DEBUG: notifyResultsPublished starting for Exam: " + exam.getTitle() 
                + " (ID: " + examId + ", Year: " + exam.getYear() + ", Sem: " + semStr + ")");

        Map<Long, com.uems.server.model.Student> studentMap = new HashMap<>();

        if ("SUPPLEMENTARY".equalsIgnoreCase(exam.getExamType())) {
            // For supplementary exams, students are in the SupplementaryAttempt table
            List<SupplementaryAttempt> attempts = supplementaryAttemptRepository.findByExamExamId(examId);
            System.out.println("DEBUG: Found " + attempts.size() + " supplementary attempts for this exam.");
            for (SupplementaryAttempt a : attempts) {
                if (a.getEnrollment() != null && a.getEnrollment().getStudent() != null) {
                    studentMap.put(a.getEnrollment().getStudent().getId(), a.getEnrollment().getStudent());
                }
            }
        } else {
            // For regular exams, students are in the Enrollment table for courses meeting year/sem
            List<Course> courses = courseRepository.findByYearAndSemester(exam.getYear(), semStr);
            List<Long> courseIds = courses.stream().map(Course::getCourseId).collect(Collectors.toList());
            System.out.println("DEBUG: Found " + courses.size() + " courses matching year/semester.");

            List<Enrollment> enrollments = enrollmentRepository.findByCourseCourseIdIn(courseIds);
            System.out.println("DEBUG: Found " + enrollments.size() + " enrollments for these courses.");

            for (Enrollment e : enrollments) {
                if (e.getStudent() != null) {
                    studentMap.put(e.getStudent().getId(), e.getStudent());
                }
            }
        }
        
        Collection<com.uems.server.model.Student> uniqueStudents;
        if (specificStudentIds != null && !specificStudentIds.isEmpty()) {
            uniqueStudents = studentRepository.findAllById(specificStudentIds);
            System.out.println("DEBUG: Using specific list of " + uniqueStudents.size() + " students for notification.");
        } else {
            uniqueStudents = studentMap.values();
            System.out.println("DEBUG: Identified " + uniqueStudents.size() + " unique students from session logic.");
        }

        // First, purge any stale notifications for this exam (handles the unpublish→republish case)
        resultNotificationRepository.deleteByExamExamId(examId);
        entityManager.flush(); // Ensure DELETE is sent to DB before new INSERTs (unique constraint)
        System.out.println("DEBUG: Purged existing notifications for exam " + examId + " before re-creating.");

        int count = 0;
        for (com.uems.server.model.Student s : uniqueStudents) {
            com.uems.server.model.ResultNotification notif = com.uems.server.model.ResultNotification.builder()
                    .year(exam.getYear())
                    .semester(String.valueOf(exam.getSemester())) // Stored as numeric string "1", "2"
                    .exam(exam)
                    .student(s) // student.getId() is PK
                    .isSeen(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            resultNotificationRepository.save(notif);
            count++;
        }
        System.out.println("DEBUG: Successfully inserted " + count + " new notifications into result_notification table.");
    }

    // --- 4. DELETE OPERATIONS ---

    @DeleteMapping("/{examId}")
    @Transactional
    public void deleteExam(@PathVariable Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        
        List<ExamSchedule> schedules = examScheduleRepository.findByExamExamId(examId);
        examScheduleRepository.deleteAll(schedules);
        resultNotificationRepository.deleteByExamExamId(examId);
        examRepository.delete(exam);
    }

    @DeleteMapping("/{examId}/schedules/{scheduleId}")
    @Transactional
    public void deleteSchedule(@PathVariable Long examId, @PathVariable Long scheduleId) {
        ExamSchedule schedule = examScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        
        if (!schedule.getExam().getExamId().equals(examId)) {
            throw new RuntimeException("Schedule does not belong to the given exam");
        }
        
        examScheduleRepository.delete(schedule);
    }

    @DeleteMapping("/{examId}/schedules")
    @Transactional
    public void deleteAllSchedules(@PathVariable Long examId) {
        List<ExamSchedule> schedules = examScheduleRepository.findByExamExamId(examId);
        examScheduleRepository.deleteAll(schedules);
    }
}
