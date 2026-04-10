package com.uems.server.controller;

import com.uems.server.dto.ChatRequest;
import com.uems.server.dto.ChatResponse;
import com.uems.server.model.User;
import com.uems.server.repository.UserRepository;
import com.uems.server.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Get the authenticated user (Spring Security principal = email)
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        String reply = chatService.processMessage(request.getMessage(), user);
        return ResponseEntity.ok(new ChatResponse(reply));
    }
}
