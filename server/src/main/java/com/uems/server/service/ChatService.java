package com.uems.server.service;

import com.uems.server.model.*;
import com.uems.server.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final AIService aiService;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final ExamScheduleRepository examScheduleRepository;
    private final FeeNotificationRepository feeNotificationRepository;
    private final StudentPaymentRepository studentPaymentRepository;

    // ═══════════════════════════════════════════════════════════════
    //  INTENT DETECTION — Regex-based
    // ═══════════════════════════════════════════════════════════════

    public enum IntentType {
        SGPA, ATTENDANCE, RESULTS, EXAMS, FEES, COURSES,
        UPDATES, PROFILE, HELP, GREETING, THANKS, LOW_ATTENDANCE,
        STATISTICS, STUDENTS, UNKNOWN
    }

    private static final Map<IntentType, Pattern> INTENT_PATTERNS = new LinkedHashMap<>();

    static {
        INTENT_PATTERNS.put(IntentType.SGPA,
                Pattern.compile("\\b(sgpa|gpa|cgpa|grade\\s*points?|performance|academic\\s*performance)\\b", Pattern.CASE_INSENSITIVE));
        INTENT_PATTERNS.put(IntentType.LOW_ATTENDANCE,
                Pattern.compile("\\b(low\\s*attendance|below\\s*75|shortage|defaulters?)\\b", Pattern.CASE_INSENSITIVE));
        INTENT_PATTERNS.put(IntentType.ATTENDANCE,
                Pattern.compile("\\b(attendance|absent|present|bunked|classes\\s*attended)\\b", Pattern.CASE_INSENSITIVE));
        INTENT_PATTERNS.put(IntentType.RESULTS,
                Pattern.compile("\\b(results?|marks?|scores?|grades?|internal|external|end\\s*sem)\\b", Pattern.CASE_INSENSITIVE));
        INTENT_PATTERNS.put(IntentType.EXAMS,
                Pattern.compile("\\b(exams?|schedules?|timetables?|date\\s*sheets?|upcoming\\s*exams?)\\b", Pattern.CASE_INSENSITIVE));
        INTENT_PATTERNS.put(IntentType.FEES,
                Pattern.compile("\\b(fees?|payments?|dues?|pending\\s*(fees?|payments?)|pay|tuition)\\b", Pattern.CASE_INSENSITIVE));
        INTENT_PATTERNS.put(IntentType.COURSES,
                Pattern.compile("\\b(courses?|subjects?|enrolled|enroll|my\\s*courses?|my\\s*subjects?)\\b", Pattern.CASE_INSENSITIVE));
        INTENT_PATTERNS.put(IntentType.UPDATES,
                Pattern.compile("\\b(updates?|news|what'?s\\s*new|notif(?:y|ications?)|alerts?|any\\s*updates?)\\b", Pattern.CASE_INSENSITIVE));
        INTENT_PATTERNS.put(IntentType.PROFILE,
                Pattern.compile("\\b(profile|info|who\\s*am\\s*i|my\\s*details?|my\\s*info)\\b", Pattern.CASE_INSENSITIVE));
        INTENT_PATTERNS.put(IntentType.STATISTICS,
                Pattern.compile("\\b(statistics?|stats?|overview|total\\s*faculty|total\\s*users?|total\\s*courses?|counts?|reports?|summary)\\b", Pattern.CASE_INSENSITIVE));
        INTENT_PATTERNS.put(IntentType.STUDENTS,
                Pattern.compile("\\b(students?|pupils?|learners?|total\\s*students?)\\b", Pattern.CASE_INSENSITIVE));
        INTENT_PATTERNS.put(IntentType.HELP,
                Pattern.compile("\\b(help|what\\s*can|commands|options|menu|assist)\\b", Pattern.CASE_INSENSITIVE));
        INTENT_PATTERNS.put(IntentType.GREETING,
                Pattern.compile("\\b(hello|hi|hey|good\\s*(morning|evening|afternoon|night)|howdy|greetings)\\b", Pattern.CASE_INSENSITIVE));
        INTENT_PATTERNS.put(IntentType.THANKS,
                Pattern.compile("\\b(thank|thanks|thx|ty|thank\\s*you|appreciate)\\b", Pattern.CASE_INSENSITIVE));
    }

    // ═══════════════════════════════════════════════════════════════
    //  CONVERSATION CONTEXT — In-memory per user
    // ═══════════════════════════════════════════════════════════════

    private static class ConversationContext {
        IntentType lastIntent;
        LocalDateTime lastActive;

        ConversationContext() {
            this.lastActive = LocalDateTime.now();
        }

        boolean isExpired() {
            return LocalDateTime.now().isAfter(lastActive.plusMinutes(10));
        }

        void update(IntentType intent, String entity) {
            this.lastIntent = intent;
            this.lastActive = LocalDateTime.now();
        }
    }

    private final ConcurrentHashMap<Long, ConversationContext> contextMap = new ConcurrentHashMap<>();

    // ═══════════════════════════════════════════════════════════════
    //  MAIN ENTRY POINT
    // ═══════════════════════════════════════════════════════════════

    public String processMessage(String message, User user) {
        try {
            if (message == null || message.trim().isEmpty()) {
                return "Please type a message and I'll be happy to help! 😊";
            }

            String trimmed = message.trim();
            String roleName = user.getRole().getName().toUpperCase();

            // 1. Detect intent
            IntentType intent = detectIntent(trimmed);

            // 2. Context fallback — if unknown, try reusing last intent
            ConversationContext ctx = contextMap.get(user.getId());
            if (ctx != null && ctx.isExpired()) {
                contextMap.remove(user.getId());
                ctx = null;
            }

            if (intent == IntentType.UNKNOWN && ctx != null && ctx.lastIntent != null) {
                // Heuristic: Only reuse context if the message is very short (likely a follow-up answer like "sem 2" or "year 1")
                // This prevents mistakenly reusing the intent for entirely new queries that the regex missed.
                if (trimmed.length() <= 15) {
                    intent = ctx.lastIntent;
                }
            }

            // 3. Update context
            if (intent != IntentType.UNKNOWN && intent != IntentType.GREETING
                    && intent != IntentType.THANKS && intent != IntentType.HELP) {
                if (ctx == null) {
                    ctx = new ConversationContext();
                    contextMap.put(user.getId(), ctx);
                }
                ctx.update(intent, extractEntity(trimmed));
            }

            // 4. Route to handler based on role
            String response;
            switch (intent) {
                case GREETING:
                    response = handleGreeting(user, roleName);
                    break;
                case THANKS:
                    response = handleThanks(user);
                    break;
                case HELP:
                    response = handleHelp(roleName);
                    break;
                case UNKNOWN:
                    response = aiService.callAI(trimmed);
                    break;
                default:
                    response = routeByRole(intent, trimmed, user, roleName);
                    break;
            }

            return response;

        } catch (Exception e) {
            log.error("Error processing chat message for user {}: {}", user.getId(), e.getMessage(), e);
            return "😅 I couldn't process your request right now. Please try again or type 'help' to see available commands.";
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  INTENT DETECTION
    // ═══════════════════════════════════════════════════════════════

    private IntentType detectIntent(String message) {
        String lower = message.toLowerCase();
        for (Map.Entry<IntentType, Pattern> entry : INTENT_PATTERNS.entrySet()) {
            if (entry.getValue().matcher(lower).find()) {
                return entry.getKey();
            }
        }
        return IntentType.UNKNOWN;
    }

    private String extractEntity(String message) {
        // Try to extract semester/year numbers from message
        java.util.regex.Matcher m = Pattern.compile("\\b(?:sem(?:ester)?\\s*)(\\d)\\b", Pattern.CASE_INSENSITIVE).matcher(message);
        if (m.find()) return m.group(1);

        m = Pattern.compile("\\b(?:year\\s*)(\\d)\\b", Pattern.CASE_INSENSITIVE).matcher(message);
        if (m.find()) return m.group(1);

        return null;
    }

    // ═══════════════════════════════════════════════════════════════
    //  ROLE ROUTING
    // ═══════════════════════════════════════════════════════════════

    private String routeByRole(IntentType intent, String message, User user, String roleName) {
        if (roleName.contains("STUDENT")) {
            return handleStudentIntent(intent, message, user);
        } else if (roleName.contains("FACULTY")) {
            return handleFacultyIntent(intent, message, user);
        } else if (roleName.contains("ADMIN")) {
            return handleAdminIntent(intent, message, user);
        }
        return aiService.callAI(message);
    }

    // ═══════════════════════════════════════════════════════════════
    //  COMMON HANDLERS
    // ═══════════════════════════════════════════════════════════════

    private String handleGreeting(User user, String roleName) {
        String name = user.getUsername();
        String roleLabel = "User";
        if (roleName.contains("STUDENT")) roleLabel = "Student";
        else if (roleName.contains("FACULTY")) roleLabel = "Faculty Member";
        else if (roleName.contains("ADMIN")) roleLabel = "Administrator";

        return String.format("Hello %s! 👋\n\n" +
                "Welcome back to UEMS. I'm your personal assistant.\n" +
                "You're logged in as: %s\n\n" +
                "How can I help you today? Type 'help' to see what I can do, or use the quick action buttons below! 💡", name, roleLabel);
    }

    private String handleThanks(User user) {
        return String.format("You're welcome, %s! 😊\n\n" +
                "Feel free to ask me anything else. I'm always here to help! 🎓", user.getUsername());
    }

    private String handleHelp(String roleName) {
        StringBuilder sb = new StringBuilder();
        sb.append("📋 Here's what I can help you with:\n\n");

        if (roleName.contains("STUDENT")) {
            sb.append("📊 SGPA / CGPA — View your academic performance\n");
            sb.append("📋 Attendance — Check your attendance status\n");
            sb.append("📝 Results / Marks — View your grades\n");
            sb.append("📅 Exam Schedule — Upcoming exams\n");
            sb.append("💰 Fee Status — Pending payments\n");
            sb.append("📚 My Courses — Enrolled courses\n");
            sb.append("🔔 Updates — Latest notifications\n");
            sb.append("👤 Profile — Your information\n");
        } else if (roleName.contains("FACULTY")) {
            sb.append("📚 My Courses — Your assigned courses\n");
            sb.append("⚠️ Low Attendance — Students below 75%\n");
            sb.append("📝 Marks — Course marks overview\n");
            sb.append("👤 Profile — Your information\n");
            sb.append("🔔 Updates — Latest notifications\n");
        } else if (roleName.contains("ADMIN")) {
            sb.append("📊 Statistics — System overview\n");
            sb.append("👥 Total Students / Faculty / Users\n");
            sb.append("📚 Courses — All courses info\n");
            sb.append("💰 Fee Overview — Payment status\n");
            sb.append("🔔 Updates — Latest notifications\n");
        }

        sb.append("\n💬 You can also ask me any general question — I'll use AI to help!");
        return sb.toString();
    }

    // ═══════════════════════════════════════════════════════════════
    //  STUDENT HANDLERS
    // ═══════════════════════════════════════════════════════════════

    private String handleStudentIntent(IntentType intent, String message, User user) {
        Student student = studentRepository.findByUser(user).orElse(null);
        if (student == null) {
            return "⚠️ Student profile not found. Please contact admin.";
        }

        switch (intent) {
            case SGPA: return handleStudentSgpa(student, user);
            case ATTENDANCE: return handleStudentAttendance(student);
            case RESULTS: return handleStudentResults(student, user);
            case EXAMS: return handleStudentExams(student);
            case FEES: return handleStudentFees(student);
            case COURSES: return handleStudentCourses(student);
            case UPDATES: return handleStudentUpdates(student, user);
            case PROFILE: return handleStudentProfile(student, user);
            case STATISTICS: return handleStudentSgpa(student, user); // students asking for stats = performance
            default: return aiService.callAI(message);
        }
    }

    private String handleStudentSgpa(Student student, User user) {
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId()).stream()
                .filter(e -> e.getGrade() != null && Boolean.TRUE.equals(e.getEndSemReleased()))
                .collect(Collectors.toList());

        if (enrollments.isEmpty()) {
            return "📊 No published results found yet.\n\n" +
                    "Your results will appear here once they are published by the admin.\n\n" +
                    "💡 Try: 'check attendance' or 'exam schedule'";
        }

        // Group by semester
        Map<String, List<Enrollment>> bySemester = enrollments.stream()
                .collect(Collectors.groupingBy(e -> e.getCourse().getYear() + "-" + e.getCourse().getSemester()));

        StringBuilder sb = new StringBuilder();
        sb.append("📊 Your Academic Performance\n\n");

        double totalSgpa = 0;
        int semCount = 0;
        List<Double> sgpaList = new ArrayList<>();

        // Sort semesters
        List<Map.Entry<String, List<Enrollment>>> sorted = new ArrayList<>(bySemester.entrySet());
        sorted.sort(Comparator.comparing(Map.Entry::getKey));

        for (Map.Entry<String, List<Enrollment>> entry : sorted) {
            List<Enrollment> sems = entry.getValue();
            int totalPoints = 0, totalCredits = 0;

            for (Enrollment e : sems) {
                if (e.getGradePoints() != null && e.getCourse().getCredits() != null) {
                    totalPoints += e.getGradePoints() * e.getCourse().getCredits();
                    totalCredits += e.getCourse().getCredits();
                }
            }

            double sgpa = totalCredits > 0 ? Math.round((double) totalPoints / totalCredits * 100.0) / 100.0 : 0.0;
            sgpaList.add(sgpa);
            totalSgpa += sgpa;
            semCount++;

            String[] parts = entry.getKey().split("-");
            sb.append(String.format("  Year %s, Sem %s: %.2f", parts[0], parts[1], sgpa));

            // Trend indicator
            if (sgpaList.size() > 1) {
                double prev = sgpaList.get(sgpaList.size() - 2);
                if (sgpa > prev) sb.append(" ↑ 📈");
                else if (sgpa < prev) sb.append(" ↓ 📉");
                else sb.append(" → ➡️");
            }
            sb.append("\n");
        }

        double cgpa = semCount > 0 ? Math.round(totalSgpa / semCount * 100.0) / 100.0 : 0.0;
        sb.append(String.format("\n🎯 Overall CGPA: %.2f\n", cgpa));

        // Insight
        if (sgpaList.size() >= 2) {
            double latest = sgpaList.get(sgpaList.size() - 1);
            double previous = sgpaList.get(sgpaList.size() - 2);
            if (latest > previous) {
                sb.append(String.format("\n🌟 Great job! Your SGPA improved by %.2f from last semester!", latest - previous));
            } else if (latest < previous) {
                sb.append(String.format("\n💪 Your SGPA dropped by %.2f. Keep working hard — you can bounce back!", previous - latest));
            } else {
                sb.append("\n📌 Your performance is consistent. Aim higher this semester!");
            }
        }

        sb.append("\n\n💡 Try: 'view results' for detailed grades or 'check attendance'");
        return sb.toString();
    }

    private String handleStudentAttendance(Student student) {
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
        if (enrollments.isEmpty()) {
            return "📋 No courses enrolled yet.\n\n💡 Try: 'my courses' or 'exam schedule'";
        }

        // Filter to current semester courses only
        String sYear = student.getYear();
        String sSem = student.getSemester();

        StringBuilder sb = new StringBuilder();
        sb.append("📋 Your Attendance Summary (Current Semester)\n\n");

        boolean hasLowAttendance = false;
        int courseCount = 0;

        for (Enrollment enrollment : enrollments) {
            Course course = enrollment.getCourse();

            // Skip past-semester courses
            if (sYear != null && sSem != null) {
                if (!String.valueOf(course.getYear()).equals(sYear)
                        || !course.getSemester().equals(sSem)) {
                    continue;
                }
            }

            Long total = attendanceRepository.countByStudentIdAndCourseCourseId(student.getId(), course.getCourseId());
            Long attended = attendanceRepository.countByStudentIdAndCourseCourseIdAndPresentTrue(student.getId(), course.getCourseId());

            if (total == 0) continue;
            courseCount++;

            double percentage = Math.round((attended.doubleValue() / total.doubleValue()) * 1000.0) / 10.0;
            String status;
            if (percentage >= 75) {
                status = "✅";
            } else {
                status = "⚠️";
                hasLowAttendance = true;
            }

            sb.append(String.format("  %s %s: %d/%d (%.1f%%)\n",
                    status, course.getCode() != null ? course.getCode() : course.getName(),
                    attended, total, percentage));
        }

        if (courseCount == 0) {
            return "📋 No attendance records found yet.\n\n💡 Your attendance will appear once faculty marks it.";
        }

        if (hasLowAttendance) {
            sb.append("\n⚠️ WARNING: You have low attendance in some subjects!\n");
            sb.append("Maintain at least 75% to be eligible for exams.\n");
        } else {
            sb.append("\n🌟 Great! Your attendance is on track in all subjects!\n");
        }

        sb.append("\n💡 Try: 'view sgpa' or 'exam schedule'");
        return sb.toString();
    }

    private String handleStudentResults(Student student, User user) {
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
        if (enrollments.isEmpty()) {
            return "📝 No course enrollments found.\n\n💡 Try: 'check attendance' or 'exam schedule'";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("📝 Your Marks & Results\n\n");

        boolean hasGrades = false;
        for (Enrollment e : enrollments) {
            String courseName = e.getCourse().getCode() != null ? e.getCourse().getCode() : e.getCourse().getName();
            StringBuilder line = new StringBuilder("  " + courseName + ": ");

            List<String> markParts = new ArrayList<>();
            if (e.getMid1Marks() != null) markParts.add("Mid1=" + e.getMid1Marks());
            if (e.getMid2Marks() != null) markParts.add("Mid2=" + e.getMid2Marks());
            if (e.getAssignmentMarks() != null) markParts.add("Assign=" + e.getAssignmentMarks());
            if (e.getEndSemMarks() != null && Boolean.TRUE.equals(e.getEndSemReleased())) {
                markParts.add("EndSem=" + e.getEndSemMarks());
            }

            if (markParts.isEmpty()) {
                line.append("Not yet available");
            } else {
                line.append(String.join(", ", markParts));
            }

            if (e.getGrade() != null && Boolean.TRUE.equals(e.getEndSemReleased())) {
                line.append(" | Grade: " + e.getGrade());
                hasGrades = true;
            }
            sb.append(line).append("\n");
        }

        if (!hasGrades) {
            sb.append("\n📌 Final grades will appear once results are published.\n");
        }

        sb.append("\n💡 Try: 'view sgpa' for overall performance or 'check attendance'");
        return sb.toString();
    }

    private String handleStudentExams(Student student) {
        try {
            Integer year = Integer.parseInt(student.getYear());
            Integer semester = Integer.parseInt(student.getSemester());
            List<ExamSchedule> schedules = examScheduleRepository.findByExamYearAndExamSemesterAndIsBroadcastedTrue(year, semester);

            if (schedules.isEmpty()) {
                return "📅 No upcoming exam schedules found.\n\n" +
                        "Schedules will appear here once published by the admin.\n\n" +
                        "💡 Try: 'check attendance' or 'view marks'";
            }

            StringBuilder sb = new StringBuilder();
            sb.append("📅 Your Upcoming Exams\n\n");

            for (ExamSchedule s : schedules) {
                sb.append(String.format("  📝 %s (%s)\n",
                        s.getCourse().getName(),
                        s.getCourse().getCode() != null ? s.getCourse().getCode() : ""));
                sb.append(String.format("     📆 Date: %s\n", s.getExamDate() != null ? s.getExamDate().toString() : "TBA"));
                sb.append(String.format("     🕐 Time: %s - %s\n\n",
                        s.getStartTime() != null ? s.getStartTime().toString() : "TBA",
                        s.getEndTime() != null ? s.getEndTime().toString() : "TBA"));
            }

            sb.append("📌 ").append(schedules.size()).append(" exam(s) scheduled. Good luck! 🍀\n\n");
            sb.append("💡 Try: 'check attendance' or 'view results'");
            return sb.toString();
        } catch (Exception e) {
            return "📅 Could not fetch exam schedules. Please check the Exam Schedule page.\n\n💡 Try: 'check attendance' or 'view marks'";
        }
    }

    private String handleStudentFees(Student student) {
        try {
            List<FeeNotification> fees = feeNotificationRepository.findApplicableFees(student.getYear(), student.getSemester());
            if (fees.isEmpty()) {
                return "💰 No pending fee notifications found.\n\n🌟 You're all clear!\n\n💡 Try: 'view sgpa' or 'exam schedule'";
            }

            StringBuilder sb = new StringBuilder();
            sb.append("💰 Fee Status\n\n");
            int pending = 0;

            for (FeeNotification fee : fees) {
                Optional<StudentPayment> payment = studentPaymentRepository
                        .findByStudentIdAndFeeNotificationIdAndStatus(student.getId(), fee.getId(), "SUCCESS");

                if (payment.isPresent()) {
                    sb.append(String.format("  ✅ %s — Paid\n", fee.getTitle()));
                } else {
                    pending++;
                    sb.append(String.format("  ❌ %s — ₹%.0f (Due: %s)\n",
                            fee.getTitle(),
                            fee.getBaseAmount(),
                            fee.getDueDate() != null ? fee.getDueDate().toString() : "N/A"));
                }
            }

            if (pending > 0) {
                sb.append(String.format("\n⚠️ You have %d pending payment(s). Please pay before the due date to avoid late fees!\n", pending));
            } else {
                sb.append("\n🌟 All fees are paid! You're up to date.\n");
            }

            sb.append("\n💡 Try: 'view sgpa' or 'check attendance'");
            return sb.toString();
        } catch (Exception e) {
            return "💰 Could not fetch fee details. Please check the Payments page.\n\n💡 Try: 'view sgpa' or 'check attendance'";
        }
    }

    private String handleStudentCourses(Student student) {
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
        if (enrollments.isEmpty()) {
            return "📚 You are not enrolled in any courses yet.\n\n💡 Contact your admin for enrollment.";
        }

        // Group enrollments by Year-Semester
        Map<String, List<Enrollment>> bySemester = enrollments.stream()
                .collect(Collectors.groupingBy(e -> e.getCourse().getYear() + "-" + e.getCourse().getSemester()));

        List<Map.Entry<String, List<Enrollment>>> sorted = new ArrayList<>(bySemester.entrySet());
        sorted.sort(Comparator.comparing(Map.Entry::getKey));

        String currentKey = student.getYear() + "-" + student.getSemester();

        StringBuilder sb = new StringBuilder();
        sb.append("📚 Your Enrolled Courses\n\n");

        for (Map.Entry<String, List<Enrollment>> entry : sorted) {
            String[] parts = entry.getKey().split("-");
            boolean isCurrent = entry.getKey().equals(currentKey);
            sb.append(String.format("%s Year %s, Sem %s%s\n",
                    isCurrent ? "📍" : "📖", parts[0], parts[1],
                    isCurrent ? " (Current)" : ""));
            for (Enrollment e : entry.getValue()) {
                Course c = e.getCourse();
                sb.append(String.format("    • %s (%s)\n",
                        c.getName(),
                        c.getCode() != null ? c.getCode() : "N/A"));
            }
            sb.append("\n");
        }

        sb.append(String.format("📌 Total: %d course(s) enrolled.\n\n", enrollments.size()));
        sb.append("💡 Try: 'check attendance' or 'view marks'");
        return sb.toString();
    }

    private String handleStudentUpdates(Student student, User user) {
        StringBuilder sb = new StringBuilder();
        sb.append("🔔 Your Latest Updates\n\n");
        boolean hasUpdates = false;

        // 1. Check for published results
        List<Enrollment> graded = enrollmentRepository.findByStudentId(student.getId()).stream()
                .filter(e -> e.getGrade() != null && Boolean.TRUE.equals(e.getEndSemReleased()))
                .collect(Collectors.toList());
        if (!graded.isEmpty()) {
            sb.append("📝 Results: " + graded.size() + " course result(s) published\n");
            hasUpdates = true;
        }

        // 2. Check upcoming exams
        try {
            Integer year = Integer.parseInt(student.getYear());
            Integer semester = Integer.parseInt(student.getSemester());
            List<ExamSchedule> exams = examScheduleRepository.findByExamYearAndExamSemesterAndIsBroadcastedTrue(year, semester);
            if (!exams.isEmpty()) {
                sb.append("📅 Exams: " + exams.size() + " exam(s) scheduled\n");
                hasUpdates = true;
            }
        } catch (Exception ignored) {}

        // 3. Check pending fees
        try {
            List<FeeNotification> fees = feeNotificationRepository.findApplicableFees(student.getYear(), student.getSemester());
            long pendingCount = fees.stream()
                    .filter(f -> studentPaymentRepository
                            .findByStudentIdAndFeeNotificationIdAndStatus(student.getId(), f.getId(), "SUCCESS")
                            .isEmpty())
                    .count();
            if (pendingCount > 0) {
                sb.append("💰 Fees: " + pendingCount + " pending payment(s)\n");
                hasUpdates = true;
            }
        } catch (Exception ignored) {}

        // 4. Check low attendance
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
        int lowCount = 0;
        for (Enrollment enrollment : enrollments) {
            Long total = attendanceRepository.countByStudentIdAndCourseCourseId(student.getId(), enrollment.getCourse().getCourseId());
            Long attended = attendanceRepository.countByStudentIdAndCourseCourseIdAndPresentTrue(student.getId(), enrollment.getCourse().getCourseId());
            if (total > 0) {
                double pct = (attended.doubleValue() / total.doubleValue()) * 100;
                if (pct < 75) lowCount++;
            }
        }
        if (lowCount > 0) {
            sb.append("⚠️ Attendance: Low attendance in " + lowCount + " course(s)!\n");
            hasUpdates = true;
        }

        if (!hasUpdates) {
            sb.append("✨ No new updates. Everything is up to date!\n");
        }

        sb.append("\n💡 Ask about any specific topic for more details.");
        return sb.toString();
    }

    private String handleStudentProfile(Student student, User user) {
        return String.format("👤 Your Profile\n\n" +
                "  📛 Name: %s\n" +
                "  📧 Email: %s\n" +
                "  🎫 Roll Number: %s\n" +
                "  🏛️ Department: %s\n" +
                "  📅 Year: %s | Semester: %s\n\n" +
                "💡 Try: 'view sgpa' or 'check attendance'",
                user.getUsername(),
                user.getEmail(),
                student.getRollNumber(),
                student.getDepartment() != null ? student.getDepartment() : "N/A",
                student.getYear(),
                student.getSemester());
    }

    // ═══════════════════════════════════════════════════════════════
    //  FACULTY HANDLERS
    // ═══════════════════════════════════════════════════════════════

    private String handleFacultyIntent(IntentType intent, String message, User user) {
        Faculty faculty = facultyRepository.findByUserId(user.getId());
        if (faculty == null) {
            return "⚠️ Faculty profile not found. Please contact admin.";
        }

        switch (intent) {
            case COURSES: return handleFacultyCourses(faculty, user);
            case LOW_ATTENDANCE:
            case ATTENDANCE: return handleFacultyLowAttendance(faculty);
            case RESULTS:
            case SGPA: return handleFacultyMarks(faculty);
            case PROFILE: return handleFacultyProfile(faculty, user);
            case UPDATES: return handleFacultyUpdates(faculty, user);
            default: return aiService.callAI(message);
        }
    }

    private String handleFacultyCourses(Faculty faculty, User user) {
        List<Course> courses = courseRepository.findByFacultyId(faculty.getId());
        if (courses.isEmpty()) {
            return "📚 No courses assigned to you yet.\n\n💡 Contact admin for course assignment.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("📚 Your Assigned Courses\n\n");

        for (Course c : courses) {
            long studentCount = enrollmentRepository.findByCourseCourseId(c.getCourseId()).size();
            sb.append(String.format("  📖 %s (%s) — %d student(s)\n",
                    c.getName(),
                    c.getCode() != null ? c.getCode() : "N/A",
                    studentCount));
        }

        sb.append(String.format("\n📌 Total: %d course(s) assigned.\n\n", courses.size()));
        sb.append("💡 Try: 'low attendance' or 'marks overview'");
        return sb.toString();
    }

    private String handleFacultyLowAttendance(Faculty faculty) {
        List<Course> courses = courseRepository.findByFacultyId(faculty.getId());
        if (courses.isEmpty()) {
            return "📚 No courses assigned. Cannot check attendance.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("⚠️ Students with Low Attendance (< 75%)\n\n");
        int totalLow = 0;

        for (Course course : courses) {
            List<Enrollment> enrollments = enrollmentRepository.findByCourseCourseId(course.getCourseId());
            List<String> lowStudents = new ArrayList<>();

            for (Enrollment enrollment : enrollments) {
                Student s = enrollment.getStudent();

                // Only check current-batch students (year/sem match the course)
                if (s.getYear() == null || s.getSemester() == null) continue;
                if (!String.valueOf(course.getYear()).equals(s.getYear())
                        || !course.getSemester().equals(s.getSemester())) {
                    continue;
                }

                Long total = attendanceRepository.countByStudentIdAndCourseCourseId(
                        s.getId(), course.getCourseId());
                Long attended = attendanceRepository.countByStudentIdAndCourseCourseIdAndPresentTrue(
                        s.getId(), course.getCourseId());

                if (total > 0) {
                    double pct = (attended.doubleValue() / total.doubleValue()) * 100;
                    if (pct < 75) {
                        String studentName = s.getUser() != null
                                ? s.getUser().getUsername()
                                : s.getRollNumber();
                        lowStudents.add(String.format("%s (%.1f%%)", studentName, pct));
                    }
                }
            }

            if (!lowStudents.isEmpty()) {
                sb.append(String.format("  📖 %s (%s):\n", course.getName(), course.getCode()));
                for (String str : lowStudents) {
                    sb.append("     • ").append(str).append("\n");
                    totalLow++;
                }
                sb.append("\n");
            }
        }

        if (totalLow == 0) {
            sb.append("🌟 All students have attendance above 75%! Great work!\n");
        } else {
            sb.append(String.format("📌 Total: %d student(s) with low attendance.\n", totalLow));
        }

        sb.append("\n💡 Try: 'my courses' or 'marks overview'");
        return sb.toString();
    }

    private String handleFacultyMarks(Faculty faculty) {
        List<Course> courses = courseRepository.findByFacultyId(faculty.getId());
        if (courses.isEmpty()) {
            return "📚 No courses assigned. Cannot show marks.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("📝 Marks Overview\n\n");

        for (Course course : courses) {
            List<Enrollment> enrollments = enrollmentRepository.findByCourseCourseId(course.getCourseId());
            long withMid1 = enrollments.stream().filter(e -> e.getMid1Marks() != null).count();
            long withMid2 = enrollments.stream().filter(e -> e.getMid2Marks() != null).count();
            long withAssign = enrollments.stream().filter(e -> e.getAssignmentMarks() != null).count();
            long total = enrollments.size();

            sb.append(String.format("  📖 %s (%s) — %d students\n", course.getName(), course.getCode(), total));
            sb.append(String.format("     Mid1: %d/%d | Mid2: %d/%d | Assign: %d/%d\n\n",
                    withMid1, total, withMid2, total, withAssign, total));
        }

        sb.append("💡 Try: 'low attendance' or 'my courses'");
        return sb.toString();
    }

    private String handleFacultyProfile(Faculty faculty, User user) {
        return String.format("👤 Faculty Profile\n\n" +
                "  📛 Name: %s\n" +
                "  📧 Email: %s\n" +
                "  🆔 Faculty Code: %s\n" +
                "  🏛️ Department: %s\n" +
                "  🎓 Designation: %s\n\n" +
                "💡 Try: 'my courses' or 'low attendance'",
                user.getUsername(),
                user.getEmail(),
                faculty.getFacultyCode(),
                faculty.getDepartment() != null ? faculty.getDepartment() : "N/A",
                faculty.getDesignation() != null ? faculty.getDesignation() : "N/A");
    }

    private String handleFacultyUpdates(Faculty faculty, User user) {
        List<Course> courses = courseRepository.findByFacultyId(faculty.getId());
        StringBuilder sb = new StringBuilder();
        sb.append("🔔 Faculty Updates\n\n");

        sb.append("📚 Courses assigned: " + courses.size() + "\n");

        int totalStudents = 0;
        int lowAttendanceCount = 0;
        int marksPending = 0;

        for (Course course : courses) {
            List<Enrollment> enrollments = enrollmentRepository.findByCourseCourseId(course.getCourseId());
            totalStudents += enrollments.size();

            for (Enrollment e : enrollments) {
                if (e.getMid1Marks() == null && e.getMid2Marks() == null) marksPending++;
                Long total = attendanceRepository.countByStudentIdAndCourseCourseId(e.getStudent().getId(), course.getCourseId());
                Long attended = attendanceRepository.countByStudentIdAndCourseCourseIdAndPresentTrue(e.getStudent().getId(), course.getCourseId());
                if (total > 0 && (attended.doubleValue() / total.doubleValue()) * 100 < 75) lowAttendanceCount++;
            }
        }

        sb.append("👥 Total students: " + totalStudents + "\n");
        if (lowAttendanceCount > 0) {
            sb.append("⚠️ Low attendance alerts: " + lowAttendanceCount + " student(s)\n");
        }
        if (marksPending > 0) {
            sb.append("📝 Marks pending: " + marksPending + " student(s) without any marks\n");
        }

        sb.append("\n💡 Type 'low attendance' or 'marks' for details.");
        return sb.toString();
    }

    // ═══════════════════════════════════════════════════════════════
    //  ADMIN HANDLERS
    // ═══════════════════════════════════════════════════════════════

    private String handleAdminIntent(IntentType intent, String message, User user) {
        switch (intent) {
            case STATISTICS: return handleAdminStats();
            case STUDENTS: return handleAdminStudents();
            case UPDATES: return handleAdminUpdates();
            case COURSES: return handleAdminCourses();
            case FEES: return handleAdminFees();
            case PROFILE: return handleAdminProfile(user);
            case ATTENDANCE: return handleAdminAttendanceOverview();
            default: return aiService.callAI(message);
        }
    }

    private String handleAdminStats() {
        long totalStudents = studentRepository.count();
        long totalFaculty = facultyRepository.count();
        long totalUsers = userRepository.count();
        long totalCourses = courseRepository.count();
        long totalEnrollments = enrollmentRepository.count();

        return String.format("📊 System Statistics\n\n" +
                "  👥 Total Users: %d\n" +
                "  🎓 Students: %d\n" +
                "  👨‍🏫 Faculty: %d\n" +
                "  📚 Courses: %d\n" +
                "  📋 Enrollments: %d\n\n" +
                "💡 Try: 'fee overview' or 'all courses'",
                totalUsers, totalStudents, totalFaculty, totalCourses, totalEnrollments);
    }

    private String handleAdminStudents() {
        List<Student> students = studentRepository.findAll();
        if (students.isEmpty()) {
            return "👥 No students enrolled in the system yet.";
        }

        Map<String, Long> byDept = students.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getDepartment() != null ? s.getDepartment() : "Unassigned",
                        Collectors.counting()));

        StringBuilder sb = new StringBuilder();
        sb.append("👥 Student Overview\n\n");
        sb.append("  Total Students: ").append(students.size()).append("\n\n");
        sb.append("  By Department:\n");

        for (Map.Entry<String, Long> entry : byDept.entrySet()) {
            sb.append(String.format("    🏛️ %s: %d student(s)\n", entry.getKey(), entry.getValue()));
        }

        sb.append("\n💡 Try: 'statistics' for overall system metrics.");
        return sb.toString();
    }

    private String handleAdminUpdates() {
        long feeCount = feeNotificationRepository.count();
        long activeExams = examScheduleRepository.findAll().stream()
                .filter(e -> Boolean.TRUE.equals(e.getIsBroadcasted()))
                .count();
        
        return String.format("🔔 Admin Updates\n\n" +
            "  The system is running smoothly.\n" +
            "  📋 Active Exams: %d broadcasted schedules\n" +
            "  💰 Fee Notifications: %d total alerts created\n\n" +
            "💡 Try: 'attendance overview' or 'fee overview'", 
            activeExams, feeCount);
    }

    private String handleAdminCourses() {
        List<Course> courses = courseRepository.findAll();
        if (courses.isEmpty()) {
            return "📚 No courses in the system yet.";
        }

        // Group by department
        Map<String, Long> byDept = courses.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getDepartment() != null ? c.getDepartment() : "Unassigned",
                        Collectors.counting()));

        StringBuilder sb = new StringBuilder();
        sb.append("📚 Course Overview\n\n");
        sb.append("  Total Courses: " + courses.size() + "\n\n");
        sb.append("  By Department:\n");

        for (Map.Entry<String, Long> entry : byDept.entrySet()) {
            sb.append(String.format("    🏛️ %s: %d course(s)\n", entry.getKey(), entry.getValue()));
        }

        long withFaculty = courses.stream().filter(c -> c.getFaculty() != null).count();
        long withoutFaculty = courses.size() - withFaculty;
        if (withoutFaculty > 0) {
            sb.append(String.format("\n⚠️ %d course(s) without assigned faculty.\n", withoutFaculty));
        }

        sb.append("\n💡 Try: 'statistics' or 'fee overview'");
        return sb.toString();
    }

    private String handleAdminFees() {
        List<FeeNotification> fees = feeNotificationRepository.findAll();
        if (fees.isEmpty()) {
            return "💰 No fee notifications created yet.\n\n💡 Try: 'statistics' or 'all courses'";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("💰 Fee Overview\n\n");

        for (FeeNotification fee : fees) {
            sb.append(String.format("  📄 %s\n", fee.getTitle()));
            sb.append(String.format("     Amount: ₹%.0f | Due: %s\n\n",
                    fee.getBaseAmount(),
                    fee.getDueDate() != null ? fee.getDueDate().toString() : "N/A"));
        }

        sb.append(String.format("📌 Total: %d fee notification(s).\n\n", fees.size()));
        sb.append("💡 Try: 'statistics' or 'all courses'");
        return sb.toString();
    }

    private String handleAdminProfile(User user) {
        return String.format("👤 Admin Profile\n\n" +
                "  📛 Name: %s\n" +
                "  📧 Email: %s\n" +
                "  🔑 Role: Administrator\n\n" +
                "💡 Try: 'statistics' or 'fee overview'",
                user.getUsername(),
                user.getEmail());
    }

    private String handleAdminAttendanceOverview() {
        long totalStudents = studentRepository.count();
        long totalCourses = courseRepository.count();

        StringBuilder sb = new StringBuilder();
        sb.append("📋 Attendance Overview\n\n");
        sb.append(String.format("  👥 Total Students: %d\n", totalStudents));
        sb.append(String.format("  📚 Total Courses: %d\n\n", totalCourses));
        sb.append("📌 For detailed attendance, check the Attendance module.\n\n");
        sb.append("💡 Try: 'statistics' or 'fee overview'");
        return sb.toString();
    }
}
