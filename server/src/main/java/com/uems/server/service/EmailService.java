package com.uems.server.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendStudentResetPasswordEmail(String to, String username, String token) {
        String resetLink = String.format("%s/reset-password?token=%s", frontendUrl, token);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Password Reset Request");

        String content = "Dear Student,\n\n" +
                "We received a request to reset your password.\n\n" +
                "Your Username: " + username + "\n\n" +
                "Click the link below to reset your password:\n" +
                resetLink + "\n\n" +
                "This link will expire in 15 minutes.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Regards,\n" +
                "UEMS Team";

        message.setText(content);
        mailSender.send(message);
    }

    public void sendFacultyResetPasswordEmail(String to, String username, String token) {
        String resetLink = String.format("%s/reset-password?token=%s", frontendUrl, token);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Password Reset Request");

        String content = "Dear Faculty,\n\n" +
                "We received a request to reset your password.\n\n" +
                "Your Username: " + username + "\n\n" +
                "Click the link below to reset your password:\n" +
                resetLink + "\n\n" +
                "This link will expire in 15 minutes.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Regards,\n" +
                "UEMS Team";

        message.setText(content);
        mailSender.send(message);
    }

    public void sendAttendanceWarningEmail(String to, String studentName, double percentage) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("⚠️ Low Attendance Warning - Action Required");

        String content = "Dear " + studentName + ",\n\n" +
                "This is an automated alert from the UEMS portal regarding your attendance status.\n\n" +
                "📊 Current Overall Attendance: " + String.format("%.1f", percentage) + "%\n" +
                "✅ Required Minimum Attendance: 75%\n\n" +
                "Your attendance has dropped below the required threshold of 75%. " +
                "Continued low attendance may result in academic consequences, including being barred from examinations.\n\n" +
                "Please make sure to attend your classes regularly to bring your attendance back above 75%.\n\n" +
                "For more details, please log in to the UEMS Student Portal and check your attendance report.\n\n" +
                "If you believe this is an error, please contact your faculty or the academic office immediately.\n\n" +
                "Regards,\n" +
                "UEMS Team";

        message.setText(content);
        mailSender.send(message);
    }

    public void sendResultsPublishedEmail(String to, String studentName, String examTitle) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("📢 Exam Results Published - " + examTitle);

        String resultsLink = String.format("%s/login", frontendUrl);

        String content = "Dear " + studentName + ",\n\n" +
                "Great news! The results for the " + examTitle + " have been officially published.\n\n" +
                "You can now view your detailed marks, grades, and academic standing on your student dashboard.\n\n" +
                "Click the link below to access your results directly:\n" +
                resultsLink + "\n\n" +
                "If you have any queries or notice any discrepancies, please reach out to the examination branch immediately.\n\n" +
                "Best regards,\n" +
                "UEMS Team";

        message.setText(content);
        mailSender.send(message);
    }
}