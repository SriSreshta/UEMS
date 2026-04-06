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

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendStudentResetPasswordEmail(String to, String username, String token) {
        String resetLink = String.format("%s/reset-password?token=%s", frontendUrl, token);
        
        SimpleMailMessage message = new SimpleMailMessage();
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

    public void sendFacultyResetPasswordEmail(String to, String token) {
        String resetLink = String.format("%s/reset-password?token=%s", frontendUrl, token);
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password Reset Request");
        
        String content = "Dear Faculty,\n\n" +
                "We received a request to reset your password.\n\n" +
                "Click the link below to reset your password:\n" +
                resetLink + "\n\n" +
                "This link will expire in 15 minutes.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Regards,\n" +
                "UEMS Team";
        
        message.setText(content);
        mailSender.send(message);
    }
}
