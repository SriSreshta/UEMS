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

    @GetMapping("/schedules")
    @PreAuthorize("hasRole('STUDENT')")
    public List<ExamScheduleDto> getBroadcastedSchedules(@AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Integer year = Integer.parseInt(user.getStudent().getYear());
        
        Integer semester = Integer.parseInt(user.getStudent().getSemester());

        List<ExamSchedule> schedules = examScheduleRepository.findByExamYearAndExamSemesterAndIsBroadcastedTrue(year, semester);
        
        return schedules.stream().map(s -> {
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
