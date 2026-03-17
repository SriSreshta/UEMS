package com.uems.server.service;

import com.uems.server.dto.CreateUserRequest;
import com.uems.server.model.Faculty;
import com.uems.server.model.Role;
import com.uems.server.model.Student;
import com.uems.server.model.User;
import com.uems.server.repository.FacultyRepository;
import com.uems.server.repository.RoleRepository;
import com.uems.server.repository.StudentRepository;
import com.uems.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void createUser(CreateUserRequest request) {
        // Validate uniqueness
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // Map Role
        String roleName = request.getRole().equalsIgnoreCase("faculty") ? "ROLE_FACULTY" : "ROLE_STUDENT";
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));

        // Generate Password
        String generatedPassword = generateRandomPassword();
        log.info("GENERATED PASSWORD FOR USER {}: {}", request.getUsername(), generatedPassword);

        // Create User Entity
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(generatedPassword));
        user.setRole(role);

        User savedUser = userRepository.save(user);

        // Create specific entity
        if (roleName.equals("ROLE_STUDENT")) {
            Student student = new Student();
            student.setUser(savedUser);
            student.setRollNumber(request.getRollNumber() != null ? request.getRollNumber() : request.getUsername());
            student.setYear(request.getYear() != null ? request.getYear() : "1");
            student.setSemester(request.getSemester() != null ? request.getSemester() : "1");
            studentRepository.save(student);
        } else if (roleName.equals("ROLE_FACULTY")) {
            Faculty faculty = new Faculty();
            faculty.setUser(savedUser);
            faculty.setDepartment(request.getDepartment() != null ? request.getDepartment() : "N/A");
            faculty.setDesignation(request.getDesignation() != null ? request.getDesignation() : "N/A");
            facultyRepository.save(faculty);
        }
    }

    @Transactional
    public List<String> importUsersFromExcel(MultipartFile file) {
        List<String> results = new ArrayList<>();
        int successCount = 0;
        int failCount = 0;

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                try {
                    CreateUserRequest req = new CreateUserRequest();
                    req.setUsername(getCellValue(row, 0));
                    req.setEmail(getCellValue(row, 1));
                    String role = getCellValue(row, 2).toLowerCase();
                    req.setRole(role);

                    if (role.equals("student")) {
                        req.setRollNumber(getCellValue(row, 3));
                        req.setYear(getCellValue(row, 4));
                        req.setSemester(getCellValue(row, 5));
                    } else if (role.equals("faculty")) {
                        req.setDepartment(getCellValue(row, 3));
                        req.setDesignation(getCellValue(row, 4));
                    }

                    createUser(req);
                    successCount++;
                } catch (Exception e) {
                    failCount++;
                    results.add("Row " + (i + 1) + " failed: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Excel file: " + e.getMessage());
        }

        results.add(0, "Import completed. Success: " + successCount + ", Failed: " + failCount);
        return results;
    }

    private String getCellValue(Row row, int cellIndex) {
        org.apache.poi.ss.usermodel.Cell cell = row.getCell(cellIndex);
        if (cell == null) return "";
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    // Use DataFormatter for consistent numeric to string conversion
                    return new org.apache.poi.ss.usermodel.DataFormatter().formatCellValue(cell).trim();
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }

    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
