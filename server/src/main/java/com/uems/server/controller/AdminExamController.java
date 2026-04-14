package com.uems.server.controller;

import com.uems.server.dto.*;
import com.uems.server.model.Course;
import com.uems.server.model.Enrollment;
import com.uems.server.model.Exam;
import com.uems.server.model.ExamSchedule;
import com.uems.server.repository.CourseRepository;
import com.uems.server.repository.EnrollmentRepository;
import com.uems.server.repository.ExamRepository;
import com.uems.server.repository.ExamScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/exams")
@CrossOrigin(origins = "*")
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

        List<Course> courses = courseRepository.findByYearAndSemester(exam.getYear(), String.valueOf(exam.getSemester()));
        System.out.println("DEBUG: previewResults - semester: " + String.valueOf(exam.getSemester()));
        System.out.println("DEBUG: previewResults - found " + courses.size() + " courses.");

        List<Long> courseIds = courses.stream().map(Course::getCourseId).collect(Collectors.toList());

        List<Enrollment> enrollments = enrollmentRepository.findByCourseCourseIdIn(courseIds);
        System.out.println("DEBUG: previewResults - found " + enrollments.size() + " enrollments.");

        Map<Long, List<Enrollment>> studentGroups = enrollments.stream()
                .collect(Collectors.groupingBy(e -> e.getStudent().getId()));
        System.out.println("DEBUG: previewResults - grouped into " + studentGroups.size() + " students.");

        List<StudentResultPreviewDto> results = new ArrayList<>();

        for (Map.Entry<Long, List<Enrollment>> entry : studentGroups.entrySet()) {
            StudentResultPreviewDto sDto = new StudentResultPreviewDto();
            sDto.setStudentId(entry.getKey());
            sDto.setHallTicketNo(entry.getValue().get(0).getStudent().getRollNumber());
            sDto.setStudentName(entry.getValue().get(0).getStudent().getUser().getUsername());
            System.out.println("DEBUG: previewResults - processing student: " + sDto.getStudentName() + " (ID: " + sDto.getStudentId() + ")");

            double totalPoints = 0;
            int totalCredits = 0;

            List<StudentResultPreviewDto.CourseResultDto> courseDtos = new ArrayList<>();
            for (Enrollment e : entry.getValue()) {
                StudentResultPreviewDto.CourseResultDto cDto = new StudentResultPreviewDto.CourseResultDto();
                cDto.setEnrollmentId(e.getId());
                cDto.setCourseId(e.getCourse().getCourseId());
                cDto.setCourseCode(e.getCourse().getCode());
                cDto.setCourseName(e.getCourse().getName());
                
                int credits = e.getCourse().getCredits() != null ? e.getCourse().getCredits() : 3;
                cDto.setCredits(credits);

                cDto.setMid1(e.getMid1Marks());
                cDto.setMid2(e.getMid2Marks());
                cDto.setAssignment(e.getAssignmentMarks());
                cDto.setEndSem(e.getEndSemMarks());
                cDto.setIsAbsent(e.getIsAbsent() != null && e.getIsAbsent());

                calculateGrades(cDto);
                courseDtos.add(cDto);

                if (cDto.getGradePoints() != null) {
                    totalPoints += cDto.getGradePoints() * credits;
                    totalCredits += credits;
                }
            }
            sDto.setCourses(courseDtos);
            
            if (totalCredits > 0) {
                double sgpa = totalPoints / totalCredits;
                sDto.setSgpa(String.format("%.2f", sgpa));
            } else {
                sDto.setSgpa("0.00");
            }

            results.add(sDto);
        }

        return results;
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
        for (StudentResultPreviewDto sDto : req.getStudents()) {
            for (StudentResultPreviewDto.CourseResultDto cDto : sDto.getCourses()) {
                Enrollment e = enrollmentRepository.findById(cDto.getEnrollmentId()).orElseThrow();
                e.setIsAbsent(cDto.getIsAbsent());
                e.setGrade(cDto.getGrade());
                e.setGradePoints(cDto.getGradePoints());
                e.setTotalMarks(cDto.getTotalMarks());
                e.setEndSemReleased(true);
                enrollmentRepository.save(e);
            }
        }
        
        // Trigger notifications automatically after publishing
        notifyResultsPublished(examId);
    }

    @PostMapping("/{examId}/notify")
    @Transactional
    public void notifyResultsPublished(@PathVariable Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        String semStr = String.valueOf(exam.getSemester());
        System.out.println("DEBUG: notifyResultsPublished starting for Exam: " + exam.getTitle() 
                + " (ID: " + examId + ", Year: " + exam.getYear() + ", Sem: " + semStr + ")");

        List<Course> courses = courseRepository.findByYearAndSemester(exam.getYear(), semStr);
        List<Long> courseIds = courses.stream().map(Course::getCourseId).collect(Collectors.toList());
        System.out.println("DEBUG: Found " + courses.size() + " courses matching year/semester.");

        List<Enrollment> enrollments = enrollmentRepository.findByCourseCourseIdIn(courseIds);
        System.out.println("DEBUG: Found " + enrollments.size() + " enrollments for these courses.");

        // IMPORTANT: Group by ID into a Map to avoid Student.hashCode() loop in HashSet
        Map<Long, com.uems.server.model.Student> studentMap = new HashMap<>();
        for (Enrollment e : enrollments) {
            if (e.getStudent() != null) {
                studentMap.put(e.getStudent().getId(), e.getStudent());
            }
        }
        Collection<com.uems.server.model.Student> uniqueStudents = studentMap.values();
        System.out.println("DEBUG: Identified " + uniqueStudents.size() + " unique students to notify.");

        int count = 0;
        for (com.uems.server.model.Student s : uniqueStudents) {
            boolean exists = resultNotificationRepository.existsByExamExamIdAndStudentId(examId, s.getId());
            if (!exists) {
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
