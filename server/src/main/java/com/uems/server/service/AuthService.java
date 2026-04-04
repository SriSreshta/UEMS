package com.uems.server.service;

import com.uems.server.model.*;
import com.uems.server.payload.*;
import com.uems.server.repository.*;
import com.uems.server.security.JwtService;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final FacultyRepository facultyRepo;
    private final StudentRepository studentRepo;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthService(UserRepository userRepo, RoleRepository roleRepo,
                       FacultyRepository facultyRepo, StudentRepository studentRepo,
                       PasswordEncoder encoder, AuthenticationManager authManager,
                       JwtService jwtService, EmailService emailService) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.facultyRepo = facultyRepo;
        this.studentRepo = studentRepo;
        this.encoder = encoder;
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
public AuthResponse login(LoginRequest req) {
    authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
    User user = userRepo.findByUsername(req.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
    String roleName = user.getRole().getName();
if (!roleName.startsWith("ROLE_")) {
    roleName = "ROLE_" + roleName;
}
String token = jwtService.generateToken(user.getUsername(), roleName);

    Long facultyId = null;
    Long studentId = null;
    if ("ROLE_FACULTY".equalsIgnoreCase(roleName) || "faculty".equalsIgnoreCase(user.getRole().getName())) {
        Faculty faculty = facultyRepo.findByUserId(user.getId());
        if (faculty != null) {
            facultyId = faculty.getId();
        }
    } else if ("ROLE_STUDENT".equalsIgnoreCase(roleName) || "student".equalsIgnoreCase(user.getRole().getName())) {
        Student student = studentRepo.findByUserId(user.getId());
        if (student != null) {
            studentId = student.getId();
        }
    }
    
    // ✅ Include username, facultyId, and studentId in response
    return new AuthResponse(token, user.getRole().getName(), user.getUsername(), facultyId, studentId);
}

public void forgotPassword(ForgotPasswordRequest req) {
    User user = userRepo.findByEmail(req.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found with this email"));

    String roleName = user.getRole().getName().toUpperCase();
    
    // Identity Validation
    if (roleName.contains("STUDENT")) {
        if (user.getStudent() == null || !user.getStudent().getRollNumber().equals(req.getRollNumber())) {
            throw new RuntimeException("Identity mismatch: Roll number does not match");
        }
    } else if (roleName.contains("FACULTY")) {
        if (!user.getUsername().equals(req.getUsername())) {
            throw new RuntimeException("Identity mismatch: Username does not match");
        }
    }

    // Generate Token
    String token = java.util.UUID.randomUUID().toString();
    user.setResetToken(token);
    user.setResetTokenExpiry(java.time.LocalDateTime.now().plusMinutes(15));
    userRepo.save(user);

    // Send Email
    emailService.sendResetPasswordEmail(user.getEmail(), token);
}

public void resetPassword(ResetPasswordRequest req) {
    User user = userRepo.findByResetToken(req.getToken())
            .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

    if (user.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
        throw new RuntimeException("Reset token has expired");
    }

    user.setPassword(encoder.encode(req.getNewPassword()));
    user.setResetToken(null);
    user.setResetTokenExpiry(null);
    userRepo.save(user);
}
}