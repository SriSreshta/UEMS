package com.uems.server.service;

import com.uems.server.dto.*;
import com.uems.server.model.*;
import com.uems.server.repository.*;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    // ── Existing dependencies ────────────────────────────────────────────────
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final PasswordEncoder passwordEncoder;

    // ── New dependencies ─────────────────────────────────────────────────────
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    // ════════════════════════════════════════════════════════════════════════
    // USER CREATION LOGIC
    // ════════════════════════════════════════════════════════════════════════

    @Transactional
    public void createUser(CreateUserRequest request) {
        // Email must remain globally unique
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        String roleName = request.getRole().equalsIgnoreCase("faculty") ? "ROLE_FACULTY" : "ROLE_STUDENT";
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));

        // Validate faculty-specific uniqueness
        if (roleName.equals("ROLE_FACULTY")) {
            String facultyCode = request.getFacultyCode();
            if (facultyCode == null || facultyCode.trim().isEmpty()) {
                throw new RuntimeException("Error: Faculty Code is required for faculty members!");
            }
            if (facultyRepository.existsByFacultyCode(facultyCode.trim())) {
                throw new RuntimeException("Error: Faculty Code '" + facultyCode + "' is already taken!");
            }
        }

        // Validate student-specific uniqueness (rollNo within same class)
        if (roleName.equals("ROLE_STUDENT")) {
            String rollNumber = request.getRollNumber();
            String department = request.getDepartment() != null ? request.getDepartment() : "N/A";
            String year = request.getYear() != null ? request.getYear() : "1";
            String semester = request.getSemester() != null ? request.getSemester() : "1";

            if (rollNumber == null || rollNumber.trim().isEmpty()) {
                throw new RuntimeException("Error: Roll Number is required for students!");
            }
            if (studentRepository.existsByRollNumberAndDepartmentAndYearAndSemester(
                    rollNumber.trim(), department, year, semester)) {
                throw new RuntimeException("Error: Roll Number '" + rollNumber + "' already exists in " +
                        department + " Year " + year + " Semester " + semester + "!");
            }
        }

        String generatedPassword = generateRandomPassword();
        log.info("GENERATED PASSWORD FOR USER {}: {}", request.getUsername(), generatedPassword);

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(generatedPassword));
        user.setRole(role);

        User savedUser = userRepository.save(user);

        if (roleName.equals("ROLE_STUDENT")) {
            Student student = new Student();
            student.setUser(savedUser);
            student.setRollNumber(request.getRollNumber() != null ? request.getRollNumber() : request.getUsername());
            student.setYear(request.getYear() != null ? request.getYear() : "1");
            student.setSemester(request.getSemester() != null ? request.getSemester() : "1");
            student.setDepartment(request.getDepartment() != null ? request.getDepartment() : "N/A");
            studentRepository.save(student);
        } else if (roleName.equals("ROLE_FACULTY")) {
            Faculty faculty = new Faculty();
            faculty.setUser(savedUser);
            faculty.setFacultyCode(request.getFacultyCode().trim());
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
                if (row == null)
                    continue;
                try {
                    CreateUserRequest req = new CreateUserRequest();
                    req.setUsername(getCellValue(row, 0));
                    req.setEmail(getCellValue(row, 1));
                    String role = getCellValue(row, 2).toLowerCase();
                    req.setRole(role);
                    if (role.equals("student")) {
                        req.setRollNumber(getCellValue(row, 3));
                        req.setDepartment(getCellValue(row, 4));
                        req.setYear(getCellValue(row, 5));
                        req.setSemester(getCellValue(row, 6));
                    } else if (role.equals("faculty")) {
                        req.setFacultyCode(getCellValue(row, 3));
                        req.setDepartment(getCellValue(row, 4));
                        req.setDesignation(getCellValue(row, 5));
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

    // ════════════════════════════════════════════════════════════════════════
    // ALL USER MANAGEMENT
    // ════════════════════════════════════════════════════════════════════════

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(u -> {
            UserResponse res = UserResponse.builder()
                    .id(u.getId())
                    .username(u.getUsername())
                    .email(u.getEmail())
                    .role(u.getRole().getName())
                    .build();

            if (u.getStudent() != null) {
                res.setRollNumber(u.getStudent().getRollNumber());
                res.setDepartment(u.getStudent().getDepartment());
                res.setYear(u.getStudent().getYear());
                res.setSemester(u.getStudent().getSemester());
            } else if (u.getFaculty() != null) {
                res.setDepartment(u.getFaculty().getDepartment());
                res.setDesignation(u.getFaculty().getDesignation());
                res.setFacultyCode(u.getFaculty().getFacultyCode());
            }
            return res;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // Unassign faculty from courses if deleting a faculty member
        if (user.getFaculty() != null) {
            List<Course> courses = courseRepository.findByFacultyId(user.getFaculty().getId());
            for (Course c : courses) {
                c.setFaculty(null);
                courseRepository.save(c);
            }
        }

        userRepository.delete(user);
    }

    // ════════════════════════════════════════════════════════════════════════
    // COURSE MANAGEMENT
    // ════════════════════════════════════════════════════════════════════════

    @Transactional
    public CourseResponse createCourse(CourseRequest request) {
        Course course = Course.builder()
                .name(request.getName())
                .code(request.getCode())
                .department(request.getDepartment())
                .year(request.getYear())
                .semester(request.getSemester())
                .isOpenElective(request.getIsOpenElective() != null && request.getIsOpenElective())
                .build();
        Course saved = courseRepository.save(course);
        return toCourseResponse(saved);
    }

    @Transactional
    public CourseResponse updateCourse(Long courseId, CourseRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
        course.setName(request.getName());
        course.setCode(request.getCode());
        course.setDepartment(request.getDepartment());
        course.setYear(request.getYear());
        course.setSemester(request.getSemester());
        course.setIsOpenElective(request.getIsOpenElective() != null && request.getIsOpenElective());
        return toCourseResponse(courseRepository.save(course));
    }

    @Transactional
    public void deleteCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        // Remove enrollments associated with this course first
        List<Enrollment> enrollments = enrollmentRepository.findByCourseCourseId(courseId);
        enrollmentRepository.deleteAll(enrollments);

        courseRepository.delete(course);
    }

    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll()
                .stream()
                .map(this::toCourseResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseResponse assignFacultyToCourse(Long courseId, Long facultyId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found: " + facultyId));
        course.setFaculty(faculty);
        return toCourseResponse(courseRepository.save(course));
    }

    // ════════════════════════════════════════════════════════════════════════
    // FACULTY LIST
    // ════════════════════════════════════════════════════════════════════════

    public List<FacultyResponse> getAllFaculties() {
        return facultyRepository.findAll()
                .stream()
                .map(f -> new FacultyResponse(
                        f.getId(),
                        f.getUser() != null ? f.getUser().getUsername() : "",
                        f.getUser() != null ? f.getUser().getEmail() : "",
                        f.getDepartment(),
                        f.getDesignation(),
                        f.getFacultyCode()))
                .collect(Collectors.toList());
    }

    // ════════════════════════════════════════════════════════════════════════
    // STUDENT FILTERING
    // ════════════════════════════════════════════════════════════════════════

    public List<StudentResponse> getStudentsFiltered(String year, String semester, String department) {
        List<Student> students;
        if (department != null && !department.isBlank()) {
            students = studentRepository.findByYearAndSemesterAndDepartment(year, semester, department);
        } else {
            students = studentRepository.findByYearAndSemester(year, semester);
        }
        return students.stream().map(this::toStudentResponse).collect(Collectors.toList());
    }

    public List<String> getAllDepartments() {
        return studentRepository.findDistinctDepartments();
    }

    // ════════════════════════════════════════════════════════════════════════
    // ENROLLMENT
    // ════════════════════════════════════════════════════════════════════════

    @Transactional
    public String enrollStudentInCourse(Long studentId, Long courseId) {
        if (enrollmentRepository.existsByStudentIdAndCourseCourseId(studentId, courseId)) {
            return "Student " + studentId + " is already enrolled in course " + courseId + ". Skipped.";
        }
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
        enrollmentRepository.save(Enrollment.builder().student(student).course(course).build());
        return "Student " + studentId + " enrolled in course " + courseId + " successfully.";
    }

    @Transactional
    public List<String> enrollStudentsInCourseBulk(List<Long> studentIds, Long courseId) {
        List<String> results = new ArrayList<>();
        for (Long studentId : studentIds) {
            results.add(enrollStudentInCourse(studentId, courseId));
        }
        return results;
    }

    /**
     * Batch enrollment: ONLY enrolls students in Core courses (matches department
     * and not open elective).
     * Open Electives are manually enrolled and preserved.
     */
    @Transactional
    public String enrollBatch(String year, String semester) {
        List<Student> students = studentRepository.findByYearAndSemester(year, semester);
        List<Course> courses = courseRepository.findByYearAndSemester(Integer.parseInt(year), semester);

        if (students.isEmpty())
            return "No students found for Year " + year + " Sem " + semester;
        if (courses.isEmpty())
            return "No courses found for Year " + year + " Sem " + semester;

        // 1. Delete existing CORE enrollments for this batch, preserving OEs.
        for (Student student : students) {
            List<Enrollment> existing = enrollmentRepository.findByStudentId(student.getId());
            for (Enrollment e : existing) {
                Boolean isOe = e.getCourse().getIsOpenElective();
                if ((isOe == null || !isOe) &&
                        e.getCourse().getYear().equals(Integer.parseInt(year)) &&
                        e.getCourse().getSemester().equals(semester)) {
                    enrollmentRepository.delete(e);
                }
            }
        }

        // 4. Enroll every student into matching CORE courses
        int count = 0;
        for (Student student : students) {
            for (Course course : courses) {
                Boolean isOe = course.getIsOpenElective();
                if ((isOe == null || !isOe)) {
                    // Only match if student department equals course department
                    String sDept = student.getDepartment();
                    String cDept = course.getDepartment();
                    if (sDept != null && cDept != null && sDept.equalsIgnoreCase(cDept)) {
                        enrollmentRepository.save(
                                Enrollment.builder().student(student).course(course).build());
                        count++;
                    }
                }
            }
        }

        return "Processed " + students.size() + " students and restored " + count + " core course mappings.";
    }

    public List<EnrollmentResponse> getEnrollmentsByCourse(Long courseId) {
        return enrollmentRepository.findByCourseCourseId(courseId)
                .stream()
                .map(this::toEnrollmentResponse)
                .collect(Collectors.toList());
    }

    public List<EnrollmentResponse> getEnrollmentsByStudent(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId)
                .stream()
                .map(this::toEnrollmentResponse)
                .collect(Collectors.toList());
    }

    // ════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ════════════════════════════════════════════════════════════════════════

    private CourseResponse toCourseResponse(Course c) {
        Long facultyId = null;
        String facultyName = null;
        String facultyDept = null;
        if (c.getFaculty() != null) {
            Faculty f = c.getFaculty();
            facultyId = f.getId();
            facultyName = f.getUser() != null ? f.getUser().getUsername() : null;
            facultyDept = f.getDepartment();
        }
        return new CourseResponse(c.getCourseId(), c.getName(), c.getCode(),
                c.getDepartment(), c.getYear(), c.getSemester(),
                facultyId, facultyName, facultyDept, c.getIsOpenElective());
    }

    private StudentResponse toStudentResponse(Student s) {
        return new StudentResponse(
                s.getId(),
                s.getUser() != null ? s.getUser().getUsername() : "",
                s.getUser() != null ? s.getUser().getEmail() : "",
                s.getRollNumber(),
                s.getYear(),
                s.getSemester(),
                s.getDepartment());
    }

    private EnrollmentResponse toEnrollmentResponse(Enrollment e) {
        return new EnrollmentResponse(
                e.getId(),
                e.getStudent().getId(),
                e.getStudent().getUser() != null ? e.getStudent().getUser().getUsername() : "",
                e.getStudent().getRollNumber(),
                e.getCourse().getCourseId(),
                e.getCourse().getName(),
                e.getCourse().getCode());
    }

    private String getCellValue(Row row, int cellIndex) {
        org.apache.poi.ss.usermodel.Cell cell = row.getCell(cellIndex);
        if (cell == null)
            return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
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
