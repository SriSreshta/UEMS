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
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepo, RoleRepository roleRepo,
                       FacultyRepository facultyRepo,
                       PasswordEncoder encoder, AuthenticationManager authManager,
                       JwtService jwtService) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.facultyRepo = facultyRepo;
        this.encoder = encoder;
        this.authManager = authManager;
        this.jwtService = jwtService;
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
    if ("ROLE_FACULTY".equalsIgnoreCase(roleName) || "faculty".equalsIgnoreCase(user.getRole().getName())) {
        Faculty faculty = facultyRepo.findByUserId(user.getId());
        if (faculty != null) {
            facultyId = faculty.getId();
        }
    }
    
    // ✅ Include username and facultyId in response
    return new AuthResponse(token, user.getRole().getName(), user.getUsername(), facultyId);
}
}