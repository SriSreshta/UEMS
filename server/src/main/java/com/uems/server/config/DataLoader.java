package com.uems.server.config;

import com.uems.server.model.Faculty;
import com.uems.server.model.Role;
import com.uems.server.model.Student;
import com.uems.server.model.User;
import com.uems.server.repository.FacultyRepository;
import com.uems.server.repository.RoleRepository;
import com.uems.server.repository.StudentRepository;
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
    private FacultyRepository facultyRepository;

    @Autowired
    private StudentRepository studentRepository;
    
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

        // Ensure Admin user always exists and PASSWORD is sync'd!
        var adminOpt = userRepository.findByEmail("admin@uems.com");
        if (adminOpt.isEmpty()) {
            System.out.println("Admin user missing! Recreating default Admin credentials...");
            userRepository.save(User.builder()
                .username("admin")
                .email("admin@uems.com")
                .password(passwordEncoder.encode(adminPassword))
                .role(adminRole)
                .build());
        } else {
            User existingAdmin = adminOpt.get();
            existingAdmin.setPassword(passwordEncoder.encode(adminPassword));
            userRepository.save(existingAdmin);
            System.out.println("Admin user found! Forced password synchronization with .env file using loaded property.");
        }

        // Create default testing users if database is entirely empty
        if (userRepository.count() <= 1) {
            System.out.println("No normal users found. Creating default students & faculty...");

            User facultyUser = userRepository.save(User.builder()
                .username("faculty1")
                .email("faculty1@uems.com")
                .password(passwordEncoder.encode(facultyPassword))
                .role(facultyRole)
                .build());

            Faculty faculty = Faculty.builder()
                .facultyCode("FAC001")
                .department("CSE")
                .designation("Professor")
                .user(facultyUser)
                .build();
            facultyRepository.save(faculty);

            User studentUser = userRepository.save(User.builder()
                .username("student1")
                .email("student1@uems.com")
                .password(passwordEncoder.encode(studentPassword))
                .role(studentRole)
                .build());

            Student student = Student.builder()
                .rollNumber("STU001")
                .year("1")
                .semester("1")
                .department("CSE")
                .user(studentUser)
                .build();
            studentRepository.save(student);

            System.out.println("✅ Default users inserted successfully!");
        } else {
            System.out.println("Users already exist. Skipping default user creation.");
        }
    }
}
