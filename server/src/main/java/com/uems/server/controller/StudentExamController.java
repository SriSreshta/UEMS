package com.uems.server.controller;

import com.uems.server.dto.ExamScheduleDto;
import com.uems.server.model.ExamSchedule;
import com.uems.server.model.User;
import com.uems.server.repository.ExamScheduleRepository;
import com.uems.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student/exams")
@CrossOrigin(origins = "*")
public class StudentExamController {

    @Autowired
    private ExamScheduleRepository examScheduleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.uems.server.repository.EnrollmentRepository enrollmentRepository;

    @GetMapping("/schedules")
    @PreAuthorize("hasRole('STUDENT')")
    public List<ExamScheduleDto> getBroadcastedSchedules(@AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Integer year = Integer.parseInt(user.getStudent().getYear());
        Integer semester = Integer.parseInt(user.getStudent().getSemester());

        // Get student's backlogs (where grade is F or Ab)
        List<Long> backlogCourseIds = enrollmentRepository.findByStudentId(user.getStudent().getId())
                .stream()
                .filter(e -> {
                    if (e.getGrade() == null) return false;
                    String g = e.getGrade().trim();
                    return "F".equalsIgnoreCase(g) || "Ab".equalsIgnoreCase(g);
                })
                .map(e -> e.getCourse().getCourseId())
                .collect(Collectors.toList());

        System.out.println("DEBUG: Student " + user.getUsername() + " has " + backlogCourseIds.size() + " backlog courses.");

        // Retrieve all broadcasted schedules safely avoiding NPE
        List<ExamSchedule> allBroadcasted = examScheduleRepository.findAll().stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsBroadcasted()))
                .collect(Collectors.toList());

        System.out.println("DEBUG: Found " + allBroadcasted.size() + " total broadcasted exam schedules system-wide.");

        // Filter for their current regular exams OR their supply backlogs
        List<ExamSchedule> visibleSchedules = allBroadcasted.stream().filter(s -> {
            boolean isRegularCurrent = "REGULAR".equalsIgnoreCase(s.getExam().getExamType()) 
                    && s.getExam().getYear().equals(year) 
                    && s.getExam().getSemester().equals(semester);
            
            boolean isSupplyBacklog = "SUPPLEMENTARY".equalsIgnoreCase(s.getExam().getExamType())
                    && backlogCourseIds.contains(s.getCourse().getCourseId());
            
            if (isSupplyBacklog) {
                System.out.println("DEBUG: Allowing supply schedule for course ID " + s.getCourse().getCourseId() + " because student has it as a backlog.");
            }
                    
            return isRegularCurrent || isSupplyBacklog;
        }).collect(Collectors.toList());
        
        return visibleSchedules.stream().map(s -> {
            ExamScheduleDto dto = new ExamScheduleDto();
            dto.setScheduleId(s.getScheduleId());
            dto.setExamId(s.getExam().getExamId());
            dto.setExamTitle(s.getExam().getTitle());
            dto.setCourseId(s.getCourse().getCourseId());
            dto.setCourseCode(s.getCourse().getCode());
            dto.setCourseName(s.getCourse().getName());
            dto.setExamDate(s.getExamDate());
            dto.setStartTime(s.getStartTime());
            dto.setEndTime(s.getEndTime());
            dto.setIsBroadcasted(true);
            return dto;
        }).collect(Collectors.toList());
    }
}
