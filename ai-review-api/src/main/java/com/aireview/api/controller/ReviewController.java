package com.aireview.api.controller;

import com.aireview.api.model.*;
import com.aireview.api.service.GateService;
import com.aireview.api.service.GitHubDiffService;
import com.aireview.api.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/review")
public class ReviewController {

    private final ReviewService reviewService;
    private final GateService gateService;
    private final GitHubDiffService gitHubDiffService;

    public ReviewController(
        ReviewService reviewService,
        GateService gateService,
        GitHubDiffService gitHubDiffService
    ) {
        this.reviewService = reviewService;
        this.gateService = gateService;
        this.gitHubDiffService = gitHubDiffService;
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> review(@Valid @RequestBody ReviewRequest request) {
        String diff = "github_pr".equals(request.getInputType())
            ? gitHubDiffService.fetchDiff(request.getInput())
            : request.getInput();

        ReviewResult result = reviewService.review(diff);
        GateResult gate = gateService.apply(result);
        return ResponseEntity.ok(new ReviewResponse(result, gate));
    }
}
