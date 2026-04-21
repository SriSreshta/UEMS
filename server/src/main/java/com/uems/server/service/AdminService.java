package com.uems.server.service;

import com.uems.server.dto.*;
import com.uems.server.dto.UpdateStudentRequest;
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
import java.util.Map;
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
    private final AttendanceRepository attendanceRepository;
    private final StudentPaymentRepository studentPaymentRepository;
    private final StudentDocumentRepository studentDocumentRepository;
    private final ResultNotificationRepository resultNotificationRepository;
    private final FeeNotificationRepository feeNotificationRepository;

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
            Student savedStudent = studentRepository.save(student);

            // Auto-enroll in all past + current core courses
            enrollStudentInAllCourses(savedStudent);
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
                res.setSection(u.getStudent().getSection());
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

        // Clean up student dependencies properly before deleting
        if (user.getStudent() != null) {
            Long studentId = user.getStudent().getId();
            attendanceRepository.deleteByStudentId(studentId);
            enrollmentRepository.deleteByStudentId(studentId);
            studentPaymentRepository.deleteByStudentId(studentId);
            studentDocumentRepository.deleteByStudentId(studentId);
            resultNotificationRepository.deleteByStudentId(studentId);
        }

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
    // EDIT STUDENT
    // ════════════════════════════════════════════════════════════════════════

    @Transactional
    public void updateStudent(Long userId, UpdateStudentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // Fetch student directly to avoid lazy-load issues
        Student student = studentRepository.findByUserId(userId);
        if (student == null) {
            throw new RuntimeException("No student record linked to user: " + userId);
        }

        // ── 1. Personal Details Update ────────────────────────────────────────
        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            user.setUsername(request.getUsername().trim());
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String newEmail = request.getEmail().trim();
            // Check duplicate email only if it actually changed
            if (!newEmail.equalsIgnoreCase(user.getEmail())) {
                if (userRepository.existsByEmail(newEmail)) {
                    throw new RuntimeException("Error: Email '" + newEmail + "' is already in use by another user!");
                }
                user.setEmail(newEmail);
            }
        }

        // ── 2. Capture OLD academic values BEFORE any updates ─────────────────
        //    This is critical for the reset scenario: we must delete enrollments
        //    for the OLD (incorrect) semester, not the new (correct) one.
        String oldYear = student.getYear();
        String oldSemester = student.getSemester();

        boolean yearChanged = request.getYear() != null
                && !request.getYear().trim().isEmpty()
                && !request.getYear().trim().equals(student.getYear());
        boolean semesterChanged = request.getSemester() != null
                && !request.getSemester().trim().isEmpty()
                && !request.getSemester().trim().equals(student.getSemester());
        boolean deptChanged = request.getDepartment() != null
                && !request.getDepartment().trim().isEmpty()
                && !request.getDepartment().trim().equals(student.getDepartment());

        // ── 3. Correction Scenario: Reset OLD semester enrollments FIRST ──────
        //    Must happen BEFORE updating academic fields so we delete the
        //    incorrect enrollments, not the correct ones.
        if (request.isResetCurrentSemesterEnrollments()) {
            int resetYear;
            try {
                resetYear = Integer.parseInt(oldYear);
            } catch (NumberFormatException e) {
                throw new RuntimeException("Invalid year value: " + oldYear);
            }
            enrollmentRepository.deleteByStudentIdAndCourseYearAndCourseSemester(
                    student.getId(), resetYear, oldSemester);
            log.info("Reset semester enrollments for student {} — removed OLD incorrect enrollments (year={}, semester={})",
                    student.getId(), resetYear, oldSemester);
        }

        // ── 4. NOW apply academic field updates ───────────────────────────────
        if (request.getYear() != null && !request.getYear().trim().isEmpty()) {
            student.setYear(request.getYear().trim());
        }
        if (request.getSemester() != null && !request.getSemester().trim().isEmpty()) {
            student.setSemester(request.getSemester().trim());
        }
        if (request.getDepartment() != null && !request.getDepartment().trim().isEmpty()) {
            student.setDepartment(request.getDepartment().trim());
        }
        if (request.getSection() != null) {
            student.setSection(request.getSection().trim());
        }

        // ── Save both entities ────────────────────────────────────────────────
        student.setUser(user);
        studentRepository.save(student);
        userRepository.save(user);

        // ── 5. Academic Update: Assign new/missing core enrollments ──────────
        //    Runs when: academic detail changed OR reset was applied
        //    enrollStudentInAllCourses only ADDS missing — never deletes past data
        if (yearChanged || semesterChanged || deptChanged || request.isResetCurrentSemesterEnrollments()) {
            int added = enrollStudentInAllCourses(student);
            log.info("Academic update for student {}: {} new enrollments added.", student.getId(), added);
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // COURSE MANAGEMENT
    // ════════════════════════════════════════════════════════════════════════

    @Transactional
    public CourseResponse createCourse(CourseRequest request) {
        // ── Duplicate course code check ───────────────────────────────────────
        if (request.getCode() != null && courseRepository.existsByCode(request.getCode().trim())) {
            throw new RuntimeException("Error: Course code '" + request.getCode().trim()
                    + "' already exists! Each course must have a unique code.");
        }

        Course course = Course.builder()
                .name(request.getName())
                .code(request.getCode())
                .department(request.getDepartment())
                .year(request.getYear())
                .semester(request.getSemester())
                .isOpenElective(request.getIsOpenElective() != null && request.getIsOpenElective())
                .credits(request.getCredits() != null && request.getCredits() > 0 ? request.getCredits() : 0)
                .build();
        Course saved = courseRepository.save(course);
        
        // Auto-recalibrate credits only if admin didn't specify credits manually
        if (request.getCredits() == null || request.getCredits() <= 0) {
            recalibrateSemesterCredits(saved.getYear(), saved.getSemester(), saved.getDepartment());
        }

        // ── Auto-enroll existing eligible students (for backdated courses) ────
        if (Boolean.TRUE.equals(request.getEnrollExistingStudents())
                && saved.getDepartment() != null && !saved.getDepartment().isBlank()
                && saved.getYear() != null && saved.getSemester() != null
                && !(Boolean.TRUE.equals(saved.getIsOpenElective()))) {
            int semInt;
            try {
                semInt = Integer.parseInt(saved.getSemester());
            } catch (NumberFormatException e) {
                log.warn("Could not parse semester for auto-enrollment: {}", saved.getSemester());
                return toCourseResponse(saved, false);
            }
            List<Student> eligibleStudents = studentRepository.findByDepartmentAtOrPastSemester(
                    saved.getDepartment(), saved.getYear(), semInt);
            int enrolled = 0;
            for (Student student : eligibleStudents) {
                if (!enrollmentRepository.existsByStudentIdAndCourseCourseId(student.getId(), saved.getCourseId())) {
                    enrollmentRepository.save(Enrollment.builder().student(student).course(saved).build());
                    enrolled++;
                }
            }
            log.info("Auto-enrolled {} existing students into new course {} ({})",
                    enrolled, saved.getName(), saved.getCode());
        }

        return toCourseResponse(saved, false);
    }

    @Transactional
    public CourseResponse updateCourse(Long courseId, CourseRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        Integer oldYear = course.getYear();
        String oldSem = course.getSemester();
        String oldDept = course.getDepartment();

        // ── Duplicate course code check (only if code is changing) ────────────
        if (request.getCode() != null && !request.getCode().trim().equals(course.getCode())) {
            if (courseRepository.existsByCode(request.getCode().trim())) {
                throw new RuntimeException("Error: Course code '" + request.getCode().trim()
                        + "' already exists on another course!");
            }
        }

        course.setName(request.getName());
        course.setCode(request.getCode());
        course.setDepartment(request.getDepartment());
        course.setYear(request.getYear());
        course.setSemester(request.getSemester());
        course.setIsOpenElective(request.getIsOpenElective() != null && request.getIsOpenElective());
        if (request.getCredits() != null && request.getCredits() > 0) {
            course.setCredits(request.getCredits());
        }
        Course updated = courseRepository.save(course);
        
        // Auto-recalibrate only if credits weren't manually specified
        if (request.getCredits() == null || request.getCredits() <= 0) {
            recalibrateSemesterCredits(oldYear, oldSem, oldDept);
            recalibrateSemesterCredits(updated.getYear(), updated.getSemester(), updated.getDepartment());
        }
        
        return toCourseResponse(updated, checkPublishedResults(updated.getCourseId()));
    }

    @Transactional
    public void deleteCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        Integer oldYear = course.getYear();
        String oldSem = course.getSemester();
        String oldDept = course.getDepartment();
        
        // Remove enrollments associated with this course first
        List<Enrollment> enrollments = enrollmentRepository.findByCourseCourseId(courseId);
        enrollmentRepository.deleteAll(enrollments);

        courseRepository.delete(course);
        
        // Recalibrate remaining courses in that semester/department
        recalibrateSemesterCredits(oldYear, oldSem, oldDept);
    }

    public List<CourseResponse> getAllCourses() {
        java.util.Set<Long> publishedCourseIds = new java.util.HashSet<>(enrollmentRepository.findCoursesWithPublishedResults());
        return courseRepository.findAll()
                .stream()
                .map(c -> toCourseResponse(c, publishedCourseIds.contains(c.getCourseId())))
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseResponse assignFacultyToCourse(Long courseId, Long facultyId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found: " + facultyId));
        course.setFaculty(faculty);
        return toCourseResponse(courseRepository.save(course), checkPublishedResults(course.getCourseId()));
    }

    private boolean checkPublishedResults(Long courseId) {
        return enrollmentRepository.findCoursesWithPublishedResults().contains(courseId);
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

    @Transactional
    public void recalibrateSemesterCredits(Integer year, String semester, String department) {
        if (year == null || semester == null) return;
        List<Course> courses;
        if (department != null && !department.isBlank()) {
            courses = courseRepository.findByYearAndSemesterAndDepartment(year, semester, department);
        } else {
            courses = courseRepository.findByYearAndSemester(year, semester);
        }
        
        if (courses.isEmpty()) return;

        int totalToDistribute = 20;
        int count = courses.size();
        int base = totalToDistribute / count;
        int remainder = totalToDistribute % count;

        for (int i = 0; i < courses.size(); i++) {
            int extra = (i < remainder) ? 1 : 0;
            courses.get(i).setCredits(base + extra);
            courseRepository.save(courses.get(i));
        }
    }

    /**
     * Syncs all existing courses in the database to follow the 20-credit rule (per Department).
     * Does NOT touch marks or enrollments.
     */
    @Transactional
    public void syncAllSystemCredits() {
        List<Course> allCourses = courseRepository.findAll();
        java.util.Set<String> processedKeys = new java.util.HashSet<>();

        for (Course c : allCourses) {
            if (c.getYear() == null || c.getSemester() == null) continue;
            String dept = c.getDepartment() != null ? c.getDepartment() : "General";
            String key = c.getYear() + "-" + c.getSemester() + "-" + dept;
            if (!processedKeys.contains(key)) {
                recalibrateSemesterCredits(c.getYear(), c.getSemester(), c.getDepartment());
                processedKeys.add(key);
            }
        }
    }

    /**
     * Performs a full academic reset
    @Transactional(readOnly = true)
    public List<GoldMedalistDto> getGoldMedalists() {
        List<Student> allStudents = studentRepository.findAll();
        List<GoldMedalistDto> goldMedalists = new ArrayList<>();

        for (Student student : allStudents) {
            List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
            
            if (enrollments.isEmpty()) continue;

            boolean hasBacklog = false;
            double totalGradePoints = 0;
            int totalCredits = 0;

            for (Enrollment e : enrollments) {
                if (e.getGrade() == null) continue;

                if (Boolean.TRUE.equals(e.getClearedViaSupplementary()) || e.getGrade().equals("F") || e.getGrade().equals("Ab")) {
                    hasBacklog = true;
                    break;
                }

                int credits = e.getCourse().getCredits() != null ? e.getCourse().getCredits() : 0;
                int points = e.getGradePoints() != null ? e.getGradePoints() : 0;

                totalGradePoints += (points * credits);
                totalCredits += credits;
            }

            if (!hasBacklog && totalCredits > 0) {
                double cgpa = totalGradePoints / totalCredits;
                if (cgpa > 8.0) {
                    goldMedalists.add(GoldMedalistDto.builder()
                            .studentId(student.getId())
                            .rollNumber(student.getRollNumber())
                            .username(student.getUser() != null ? student.getUser().getUsername() : "Unknown")
                            .department(student.getDepartment())
                            .cgpa(Math.round(cgpa * 100.0) / 100.0)
                            .totalCredits(totalCredits)
                            .build());
                }
            }
        }

        // Sort by CGPA descending
        goldMedalists.sort((a, b) -> b.getCgpa().compareTo(a.getCgpa()));
        return goldMedalists;
    }
     * 1. Wipes all marks, grades, and release statuses.
     * 2. Recalibrates all course credits to sum to 20.
     */
    @Transactional
    public void performSystemAcademicReset() {
        // 1. Wipe all academic results
        enrollmentRepository.hardResetAllResults();
        
        // 2. Sync all credits to 20-sum rule
        syncAllSystemCredits();

        // 3. Clear result notifications
        resultNotificationRepository.deleteAll();
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

        if (students.isEmpty())
            return "No students found for Year " + year + " Sem " + semester;

        // Enroll every student into ALL past + current core courses (cumulative)
        int totalNewEnrollments = 0;
        for (Student student : students) {
            totalNewEnrollments += enrollStudentInAllCourses(student);
        }

        return "Processed " + students.size() + " students. Added " + totalNewEnrollments + " new course enrollments.";
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
    // CUMULATIVE ENROLLMENT
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Enroll a student in ALL core (non-open-elective) courses from semester 1-1
     * up to their current year/semester, matching their department.
     * Only ADDS missing enrollments — never deletes or modifies existing ones.
     * 
     * @return number of new enrollments created
     */
    public int enrollStudentInAllCourses(Student student) {
        String dept = student.getDepartment();
        if (dept == null || dept.isBlank() || dept.equals("N/A")) {
            log.warn("Skipping enrollment for student {} — no valid department", student.getId());
            return 0;
        }

        int yearInt;
        int semInt;
        try {
            yearInt = Integer.parseInt(student.getYear());
            semInt = Integer.parseInt(student.getSemester());
        } catch (NumberFormatException e) {
            log.warn("Skipping enrollment for student {} — invalid year/semester: {}/{}",
                    student.getId(), student.getYear(), student.getSemester());
            return 0;
        }

        List<Course> courses = courseRepository.findDepartmentCoursesUpTo(dept, yearInt, semInt);

        int count = 0;
        for (Course course : courses) {
            if (!enrollmentRepository.existsByStudentIdAndCourseCourseId(student.getId(), course.getCourseId())) {
                enrollmentRepository.save(
                        Enrollment.builder().student(student).course(course).build());
                count++;
            }
        }

        return count;
    }

    /**
     * Backfill missing enrollments for ALL existing students.
     * Only adds — never deletes or modifies existing enrollment/marks/grades.
     */
    @Transactional
    public String backfillAllStudentEnrollments() {
        List<Student> allStudents = studentRepository.findAll();
        int totalNew = 0;
        int studentsProcessed = 0;

        for (Student student : allStudents) {
            int added = enrollStudentInAllCourses(student);
            if (added > 0) {
                studentsProcessed++;
                totalNew += added;
            }
        }

        String result = String.format("Backfill complete. Processed %d students total, " +
                "%d students had missing enrollments, %d new enrollments created.",
                allStudents.size(), studentsProcessed, totalNew);
        log.info(result);
        return result;
    }

    @Transactional(readOnly = true)
    public List<GoldMedalistDto> getGoldMedalists() {
        // 1. Batch fetch ALL graded enrollments with student and course loaded
        List<Enrollment> allGraded = enrollmentRepository.findAllReleasedWithStudentAndCourse();
        
        // 2. Group by student ID for processing
        Map<Long, List<Enrollment>> studentData = allGraded.stream()
                .collect(Collectors.groupingBy(e -> e.getStudent().getId()));

        List<GoldMedalistDto> goldMedalists = new ArrayList<>();

        for (Map.Entry<Long, List<Enrollment>> entry : studentData.entrySet()) {
            List<Enrollment> enrollments = entry.getValue();
            if (enrollments.isEmpty()) continue;

            Student student = enrollments.get(0).getStudent();
            boolean hasBacklog = false;
            double totalGradePoints = 0;
            int totalCredits = 0;

            for (Enrollment e : enrollments) {
                // Grade is already guaranteed NOT NULL by the query filter
                if (e.getGrade().equals("F") || e.getGrade().equals("Ab")) {
                    hasBacklog = true;
                    break;
                }

                int credits = (e.getCourse().getCredits() != null) ? e.getCourse().getCredits() : 0;
                int points = (e.getGradePoints() != null) ? e.getGradePoints() : 0;

                totalGradePoints += (points * credits);
                totalCredits += credits;
            }

            if (!hasBacklog && totalCredits > 0) {
                double cgpa = totalGradePoints / totalCredits;
                if (cgpa > 8.0) {
                    goldMedalists.add(GoldMedalistDto.builder()
                            .studentId(student.getId())
                            .rollNumber(student.getRollNumber())
                            .username(student.getUser() != null ? student.getUser().getUsername() : "Unknown")
                            .department(student.getDepartment())
                            .cgpa(Math.round(cgpa * 100.0) / 100.0)
                            .totalCredits(totalCredits)
                            .build());
                }
            }
        }

        // Sort by CGPA descending
        goldMedalists.sort((a, b) -> b.getCgpa().compareTo(a.getCgpa()));
        return goldMedalists;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        long studentCount = studentRepository.count();
        long courseCount = courseRepository.count();
        long feeCount = feeNotificationRepository.count();

        return DashboardStatsDto.builder()
                .studentCount(studentCount)
                .courseCount(courseCount)
                .feeNotificationCount(feeCount)
                .build();
    }

    // ════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ════════════════════════════════════════════════════════════════════════

    private CourseResponse toCourseResponse(Course c, boolean hasPublishedResults) {
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
                facultyId, facultyName, facultyDept, c.getIsOpenElective(), c.getCredits(), hasPublishedResults);
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
