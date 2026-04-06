package com.uems.server.config;

import com.uems.server.model.Role;
import com.uems.server.model.User;
import com.uems.server.repository.RoleRepository;
import com.uems.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${default.admin.password}")
    private String adminPassword;

    @org.springframework.beans.factory.annotation.Value("${default.faculty.password}")
    private String facultyPassword;

    @org.springframework.beans.factory.annotation.Value("${default.student.password}")
    private String studentPassword;

    @Override
    public void run(String... args) throws Exception {
        // Ensure base roles exist
        Role studentRole = roleRepository.findByName("ROLE_STUDENT")
            .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_STUDENT").build()));
        
        Role facultyRole = roleRepository.findByName("ROLE_FACULTY")
            .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_FACULTY").build()));
        
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
            .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").build()));

        // Create default users if none exist
        if (userRepository.count() == 0) {
            System.out.println("No users found. Creating default credentials...");

            userRepository.save(User.builder()
                .username("admin")
                .email("admin@uems.com")
                .password(passwordEncoder.encode(adminPassword))
                .role(adminRole)
                .build());

            userRepository.save(User.builder()
                .username("faculty1")
                .email("faculty1@uems.com")
                .password(passwordEncoder.encode(facultyPassword))
                .role(facultyRole)
                .build());

            userRepository.save(User.builder()
                .username("student1")
                .email("student1@uems.com")
                .password(passwordEncoder.encode(studentPassword))
                .role(studentRole)
                .build());

            System.out.println("✅ Default users inserted successfully!");
        } else {
            System.out.println("Users already exist. Skipping default user creation.");
        }
    }
}
