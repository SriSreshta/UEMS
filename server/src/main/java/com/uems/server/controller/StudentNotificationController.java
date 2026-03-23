package com.uems.server.controller;

import com.uems.server.dto.ResultNotificationDto;
import com.uems.server.model.ResultNotification;
import com.uems.server.model.User;
import com.uems.server.repository.ResultNotificationRepository;
import com.uems.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student/notifications")
@CrossOrigin(origins = "*")
public class StudentNotificationController {

    @Autowired
    private ResultNotificationRepository resultNotificationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/results")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public List<ResultNotificationDto> getResultNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        List<ResultNotification> notifs = resultNotificationRepository.findByStudentIdAndIsSeenFalse(user.getStudent().getId());
        
        return notifs.stream().map(n -> new ResultNotificationDto(
                n.getId(),
                n.getExam().getExamId(),
                n.getExam().getTitle(),
                n.getYear(),
                n.getSemester(),
                n.getIsSeen(),
                n.getCreatedAt()
        )).collect(Collectors.toList());
    }

    @PutMapping("/{id}/seen")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public void markNotificationSeen(@PathVariable Long id) {
        ResultNotification notif = resultNotificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notif.setIsSeen(true);
        resultNotificationRepository.save(notif);
    }
}
