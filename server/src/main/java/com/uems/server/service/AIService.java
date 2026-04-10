package com.uems.server.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AIService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

    private static final int MAX_RETRIES = 3;
    private static final long RETRY_DELAY_MS = 1000;

    private static final String SYSTEM_PROMPT =
            "You are UEMS Assistant, a friendly and helpful university management system assistant. " +
            "Answer briefly, clearly, and helpfully. Keep responses concise (under 3-4 sentences). " +
            "Do not use markdown formatting like ** or ##. Use plain text with emojis where appropriate. " +
            "If asked about something unrelated to education or university, politely redirect. " +
            "Always be encouraging and supportive to students.";

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Calls Gemini AI with a structured university-assistant persona prompt.
     * Implements retry logic: up to 3 attempts with 1-second delay between retries.
     */
    public String callAI(String message) {
        String fullPrompt = SYSTEM_PROMPT + "\n\nUser: " + message;

        // Build request body
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", fullPrompt)
                        ))
                )
        );

        String url = GEMINI_URL + "?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                ResponseEntity<Map> response = restTemplate.exchange(
                        url, HttpMethod.POST, entity, Map.class
                );

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    return extractResponseText(response.getBody());
                }

                log.warn("Gemini API returned non-success status: {} (attempt {}/{})",
                        response.getStatusCode(), attempt, MAX_RETRIES);

            } catch (Exception e) {
                log.warn("Gemini API call failed (attempt {}/{}): {}", attempt, MAX_RETRIES, e.getMessage());
            }

            // Wait before retrying (skip wait on last attempt)
            if (attempt < MAX_RETRIES) {
                try {
                    Thread.sleep(RETRY_DELAY_MS);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }

        return "🤖 AI is currently busy. Please try again in a moment, or type 'help' to see what I can do!";
    }

    /**
     * Extracts the text response from Gemini API response body.
     * Path: candidates[0].content.parts[0].text
     */
    @SuppressWarnings("unchecked")
    private String extractResponseText(Map<String, Object> body) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                return "I couldn't generate a response. Please try again.";
            }

            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");

            if (parts == null || parts.isEmpty()) {
                return "I couldn't generate a response. Please try again.";
            }

            String text = (String) parts.get(0).get("text");
            return text != null ? text.trim() : "I couldn't generate a response. Please try again.";

        } catch (Exception e) {
            log.error("Failed to parse Gemini API response: {}", e.getMessage());
            return "I couldn't process the AI response. Please try again.";
        }
    }
}
