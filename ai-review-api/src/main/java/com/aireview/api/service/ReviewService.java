package com.aireview.api.service;

import com.aireview.api.model.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.util.*;

@Service
public class ReviewService {

    private static final String SYSTEM_PROMPT = """
        You are an expert code reviewer. You will be given a git diff representing a pull request. Your job is to analyze it thoroughly and return a structured JSON review.

        Analyze the diff for ALL of the following concern types:
        - Correctness: logic errors, bugs, off-by-one errors, null/undefined handling, race conditions
        - Security: SQL injection, XSS, hardcoded secrets, insecure dependencies, auth bypasses, unsafe deserialization
        - Code Smell: dead code, duplicated logic, overly complex functions, poor naming, magic numbers
        - Maintainability: missing comments, overly coupled code, violation of SOLID principles, tech debt
        - Missing Tests: untested branches, missing edge case tests, no unit tests for new functions
        - Dependency: outdated packages, vulnerable versions, unnecessary new dependencies

        For EACH issue you find, assign a severity:
        - Critical: exploitable security vulnerabilities, data loss bugs, crashes in main paths
        - High: significant bugs or security weaknesses requiring immediate attention
        - Medium: code quality and maintainability issues worth fixing soon
        - Low: style, minor improvements, informational observations

        Return ONLY valid JSON — no markdown, no explanation outside the JSON — in exactly this format:
        {
          "summary": "2-3 sentence overall assessment of the PR",
          "issues": [
            {
              "category": "<one of: Correctness|Security|Code Smell|Maintainability|Missing Tests|Dependency>",
              "severity": "<one of: Critical|High|Medium|Low>",
              "title": "Short headline under 80 characters",
              "description": "Detailed explanation of the problem",
              "file": "filename.ts or null",
              "line": 42,
              "suggestion": "How to fix this"
            }
          ]
        }

        If there are no issues in a category, omit those issues. If the diff is clean, return an empty issues array.
        """;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${openai.messages-path:/anthropic/v1/messages}")
    private String messagesPath;

    @Value("${openai.model:claude-sonnet-4-5}")
    private String model;

    @Value("${openai.api-key}")
    private String apiKey;

    public ReviewService(
        @Value("${openai.base-url}") String baseUrl,
        WebClient.Builder builder,
        ObjectMapper objectMapper
    ) {
        // baseUrl is e.g. http://localhost:6655  (Anthropic proxy, no /v1 suffix needed here)
        String base = baseUrl.endsWith("/v1") ? baseUrl.substring(0, baseUrl.length() - 3) : baseUrl;
        this.webClient = builder.baseUrl(base).build();
        this.objectMapper = objectMapper;
    }

    public ReviewResult review(String diff) {
        String userMessage = "Here is the git diff to review:\n\n<diff>\n" + diff + "\n</diff>";

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("model", model);
        requestBody.put("max_tokens", 4096);
        requestBody.put("system", SYSTEM_PROMPT);
        requestBody.put("messages", List.of(
            Map.of("role", "user", "content", userMessage)
        ));

        String rawResponse = webClient.post()
            .uri(messagesPath)
            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .header("x-api-key", apiKey)
            .header("anthropic-version", "2023-06-01")
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(String.class)
            .block();

        return parseAnthropicResponse(rawResponse, diff);
    }

    private ReviewResult parseAnthropicResponse(String rawResponse, String diff) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            // Anthropic format: { "content": [{ "type": "text", "text": "..." }] }
            String content = root.path("content").get(0).path("text").asText();
            return parseReviewJson(content, diff);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI response: " + e.getMessage() + "\nRaw: " + rawResponse, e);
        }
    }

    private ReviewResult parseReviewJson(String content, String diff) {
        try {
            // Strip markdown fences if present
            String json = content.strip();
            if (json.startsWith("```")) {
                json = json.replaceAll("(?s)^```[a-z]*\\n?", "").replaceAll("```\\s*$", "").strip();
            }

            JsonNode parsed = objectMapper.readTree(json);

            ReviewResult result = new ReviewResult();
            result.setSummary(parsed.path("summary").asText());
            result.setReviewedAt(Instant.now().toString());
            result.setModel(model);
            result.setDiffStats(parseDiffStats(diff));

            List<ReviewIssue> issues = new ArrayList<>();
            for (JsonNode item : parsed.path("issues")) {
                ReviewIssue issue = new ReviewIssue();
                try {
                    issue.setCategory(IssueCategory.fromLabel(item.path("category").asText()));
                    issue.setSeverity(Severity.fromLabel(item.path("severity").asText()));
                } catch (IllegalArgumentException e) {
                    continue; // skip issues with unknown category/severity
                }
                issue.setTitle(item.path("title").asText());
                issue.setDescription(item.path("description").asText());

                JsonNode fileNode = item.path("file");
                if (!fileNode.isNull() && !fileNode.isMissingNode() && !fileNode.asText().equalsIgnoreCase("null")) {
                    issue.setFile(fileNode.asText());
                }
                JsonNode lineNode = item.path("line");
                if (!lineNode.isNull() && !lineNode.isMissingNode() && lineNode.isNumber()) {
                    issue.setLine(lineNode.asInt());
                }
                JsonNode suggNode = item.path("suggestion");
                if (!suggNode.isNull() && !suggNode.isMissingNode()) {
                    issue.setSuggestion(suggNode.asText());
                }
                issues.add(issue);
            }
            result.setIssues(issues);
            return result;

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse review JSON: " + e.getMessage() + "\nContent: " + content, e);
        }
    }

    private ReviewResult.DiffStats parseDiffStats(String diff) {
        Set<String> files = new HashSet<>();
        int added = 0, removed = 0;
        for (String line : diff.split("\n")) {
            if (line.startsWith("+++ ") && !line.startsWith("+++ /dev/null")) {
                files.add(line.substring(4));
            } else if (line.startsWith("+") && !line.startsWith("+++")) {
                added++;
            } else if (line.startsWith("-") && !line.startsWith("---")) {
                removed++;
            }
        }
        return new ReviewResult.DiffStats(files.size(), added, removed);
    }
}
