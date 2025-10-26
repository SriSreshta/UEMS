package com.uems.server.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
public class TestController {

    @GetMapping("/student/home")
    public String studentHome() {
        return "Welcome Student! Authenticated successfully.";
    }

    @GetMapping("/faculty/home")
    public String facultyHome() {
        return "Welcome Faculty! Authenticated successfully.";
    }

    @GetMapping("/admin/home")
    public String adminHome() {
        return "Welcome Admin! Authenticated successfully.";
    }
}
