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
    @PreAuthorize("hasRole('STUDENT')")
    public List<ResultNotificationDto> getResultNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Long studentId = user.getStudent().getId();
        System.out.println("DEBUG: Fetching notifications for Student PK: " + studentId + " (User: " + user.getUsername() + ")");
        List<ResultNotification> notifs = resultNotificationRepository.findByStudentIdAndIsSeenFalse(studentId);
        
        List<ResultNotificationDto> dtos = notifs.stream().map(n -> new ResultNotificationDto(
                n.getId(),
                n.getExam().getExamId(),
                n.getExam().getTitle(),
                n.getYear(),
                n.getSemester(),
                n.getIsSeen(),
                n.getCreatedAt()
        )).collect(Collectors.toList());

        System.out.println("RAW API RESPONSE SHAPE LOG: Returning " + dtos.size() + " unseen notifications.");
        if (!dtos.isEmpty()) {
            ResultNotificationDto first = dtos.get(0);
            System.out.println("First notification structure: { id: " + first.getId() 
                + ", examId: " + first.getExamId() 
                + ", year: " + first.getYear() 
                + ", semester: " + first.getSemester() 
                + ", isSeen: " + first.getIsSeen() + " }");
            
            // Only return the single most latest notification
            dtos = java.util.Collections.singletonList(first);
        }

        return dtos;
    }

    @PutMapping("/{id}/seen")
    @PreAuthorize("hasRole('STUDENT')")
    @org.springframework.transaction.annotation.Transactional
    public void markNotificationSeen(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Long studentId = user.getStudent().getId();

        ResultNotification notif = resultNotificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
                
        // Ensure the notification belongs to the authenticated student
        if (!notif.getStudent().getId().equals(studentId)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Access Denied");
        }

        notif.setIsSeen(true);
        resultNotificationRepository.save(notif);
        
        // Also mark any other older unseen notifications for this student as seen
        List<ResultNotification> otherNotifs = resultNotificationRepository.findByStudentIdAndIsSeenFalse(studentId);
        if (!otherNotifs.isEmpty()) {
            for (ResultNotification n : otherNotifs) {
                n.setIsSeen(true);
            }
            resultNotificationRepository.saveAll(otherNotifs);
        }
    }
}
