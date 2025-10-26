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
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepo, RoleRepository roleRepo,
                       PasswordEncoder encoder, AuthenticationManager authManager,
                       JwtService jwtService) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.encoder = encoder;
        this.authManager = authManager;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest req) {
    authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
    User user = userRepo.findByUsername(req.getUsername())
        .orElseThrow(() -> new RuntimeException("User not found"));
    String token = jwtService.generateToken(user.getUsername(), user.getRole().getName());
    return new AuthResponse(token, user.getRole().getName());
}

}
