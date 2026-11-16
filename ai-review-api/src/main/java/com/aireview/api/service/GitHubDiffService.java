package com.aireview.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Resolves a GitHub PR URL to its raw unified diff.
 * Supports: https://github.com/{owner}/{repo}/pull/{number}
 */
@Service
public class GitHubDiffService {

    private static final Pattern PR_PATTERN = Pattern.compile(
        "https://github\\.com/([^/]+)/([^/]+)/pull/(\\d+)"
    );

    private final WebClient webClient;

    @Value("${github.token:}")
    private String githubToken;

    public GitHubDiffService(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://api.github.com").build();
    }

    public String fetchDiff(String prUrl) {
        Matcher m = PR_PATTERN.matcher(prUrl.trim());
        if (!m.find()) {
            throw new IllegalArgumentException(
                "Invalid GitHub PR URL. Expected format: https://github.com/{owner}/{repo}/pull/{number}"
            );
        }

        String owner = m.group(1);
        String repo  = m.group(2);
        String number = m.group(3);

        WebClient.RequestHeadersSpec<?> request = webClient
            .get()
            .uri("/repos/{owner}/{repo}/pulls/{number}", owner, repo, number)
            .header(HttpHeaders.ACCEPT, "application/vnd.github.diff");

        if (githubToken != null && !githubToken.isBlank()) {
            request = ((WebClient.RequestHeadersSpec<?>) request)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + githubToken);
        }

        String diff = request
            .retrieve()
            .bodyToMono(String.class)
            .block();

        if (diff == null || diff.isBlank()) {
            throw new RuntimeException("GitHub returned an empty diff for PR: " + prUrl);
        }

        return diff;
    }
}
