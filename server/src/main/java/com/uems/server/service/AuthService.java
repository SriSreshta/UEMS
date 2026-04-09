package com.uems.server.service;

import com.uems.server.model.*;
import com.uems.server.payload.*;
import com.uems.server.repository.*;
import com.uems.server.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final FacultyRepository facultyRepo;
    private final StudentRepository studentRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthService(UserRepository userRepo, RoleRepository roleRepo,
                       FacultyRepository facultyRepo, StudentRepository studentRepo,
                       PasswordEncoder encoder,
                       JwtService jwtService, EmailService emailService) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.facultyRepo = facultyRepo;
        this.studentRepo = studentRepo;
        this.encoder = encoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    public AuthResponse login(LoginRequest req) {
        String username = req.getUsername() != null ? req.getUsername().trim() : "";
        String password = req.getPassword() != null ? req.getPassword().trim() : "";
        String rollNumber = req.getRollNumber() != null ? req.getRollNumber().trim() : "";
        String facultyCode = req.getFacultyCode() != null ? req.getFacultyCode().trim() : "";
        String role = req.getRole() != null ? req.getRole().trim().toLowerCase() : "";

        User user = null;

        // ══════════════════════════════════════════════════════════════
        //  ADMIN LOGIN — username + password (admin is single user)
        // ══════════════════════════════════════════════════════════════
        if ("admin".equals(role)) {
            // Support searching by either username or email safely
            List<User> matchingUsers = new java.util.ArrayList<>(userRepo.findAllByUsername(username));
            userRepo.findByEmail(username).ifPresent(u -> {
                if (!matchingUsers.contains(u)) {
                    matchingUsers.add(u);
                }
            });

            for (User candidate : matchingUsers) {
                if (candidate.getRole() != null && candidate.getRole().getName().toUpperCase().contains("ADMIN")) {
                    boolean passMatch = encoder.matches(password, candidate.getPassword());
                    if (passMatch) {
                        user = candidate;
                        break;
                    }
                }
            }

            if (user == null) {
                throw new RuntimeException("Invalid credentials");
            }
            
            if (user == null) {
                throw new RuntimeException("Invalid credentials");
            }

            String roleName = user.getRole().getName().toUpperCase();
            String tokenRole = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
            String token = jwtService.generateToken(user.getEmail(), tokenRole);
            return new AuthResponse(token, user.getRole().getName(), user.getUsername(), null, null, null);
        }

        // ══════════════════════════════════════════════════════════════
        //  STUDENT LOGIN — username + rollNumber + password
        // ══════════════════════════════════════════════════════════════
        if ("student".equals(role)) {
            if (rollNumber.isEmpty()) {
                throw new RuntimeException("Roll number is required for student login");
            }

            // Find all users with this username
            List<User> matchingUsers = userRepo.findAllByUsername(username);
            if (matchingUsers.isEmpty()) {
                throw new RuntimeException("Invalid credentials");
            }

            // Find the student with matching rollNumber among these users
            for (User candidate : matchingUsers) {
                String candidateRole = candidate.getRole().getName().toUpperCase();
                if (!candidateRole.contains("STUDENT")) continue;

                Student student = studentRepo.findByUserId(candidate.getId());
                if (student != null && student.getRollNumber().equals(rollNumber)) {
                    if (encoder.matches(password, candidate.getPassword())) {
                        user = candidate;
                        break;
                    }
                }
            }

            if (user == null) {
                throw new RuntimeException("Invalid credentials");
            }

            Student student = studentRepo.findByUserId(user.getId());
            String roleName = user.getRole().getName().toUpperCase();
            String tokenRole = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
            String token = jwtService.generateToken(user.getEmail(), tokenRole);
            return new AuthResponse(token, user.getRole().getName(), user.getUsername(),
                    null, student != null ? student.getId() : null, null);
        }

        // ══════════════════════════════════════════════════════════════
        //  FACULTY LOGIN — username + facultyCode + password
        // ══════════════════════════════════════════════════════════════
        if ("faculty".equals(role)) {
            if (facultyCode.isEmpty()) {
                throw new RuntimeException("Faculty code is required for faculty login");
            }

            // Find faculty by facultyCode (unique)
            Faculty faculty = facultyRepo.findByFacultyCode(facultyCode)
                    .orElseThrow(() -> new RuntimeException("Invalid credentials"));

            user = faculty.getUser();
            if (user == null || !user.getUsername().equals(username)) {
                throw new RuntimeException("Invalid credentials");
            }

            if (!encoder.matches(password, user.getPassword())) {
                throw new RuntimeException("Invalid credentials");
            }

            String roleName = user.getRole().getName().toUpperCase();
            String tokenRole = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
            String token = jwtService.generateToken(user.getEmail(), tokenRole);
            return new AuthResponse(token, user.getRole().getName(), user.getUsername(),
                    faculty.getId(), null, faculty.getFacultyCode());
        }

        throw new RuntimeException("Invalid credentials: role not specified");
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
            // Validate using facultyCode instead of username
            if (user.getFaculty() == null || !user.getFaculty().getFacultyCode().equals(req.getFacultyCode())) {
                throw new RuntimeException("Identity mismatch: Faculty code does not match");
            }
        }

        // Generate Token
        String token = java.util.UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        userRepo.save(user);

        // Send Email
        if (roleName.contains("STUDENT")) {
            emailService.sendStudentResetPasswordEmail(user.getEmail(), user.getUsername(), token);
        } else {
            emailService.sendFacultyResetPasswordEmail(user.getEmail(), user.getUsername(), token);
        }
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