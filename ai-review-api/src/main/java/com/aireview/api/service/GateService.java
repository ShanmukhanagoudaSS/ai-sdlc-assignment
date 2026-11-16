package com.aireview.api.service;

import com.aireview.api.model.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GateService {

    public GateResult apply(ReviewResult result) {
        List<ReviewIssue> issues = result.getIssues();

        int critical = count(issues, Severity.CRITICAL);
        int high     = count(issues, Severity.HIGH);
        int medium   = count(issues, Severity.MEDIUM);
        int low      = count(issues, Severity.LOW);

        GateVerdict verdict;
        String reason;

        if (critical > 0) {
            verdict = GateVerdict.BLOCK;
            reason  = critical + " Critical issue(s) detected — merge is blocked until resolved.";
        } else if (high > 0) {
            verdict = GateVerdict.PASS_WITH_REVIEW;
            reason  = high + " High severity issue(s) require mandatory human review before merging.";
        } else {
            verdict = GateVerdict.PASS;
            int other = medium + low;
            reason = other > 0
                ? "No critical or high severity issues found. Review recommended for " + other + " medium/low item(s)."
                : "No issues found. Diff looks clean.";
        }

        GateResult gate = new GateResult();
        gate.setVerdict(verdict);
        gate.setReason(reason);
        gate.setCriticalCount(critical);
        gate.setHighCount(high);
        gate.setMediumCount(medium);
        gate.setLowCount(low);
        return gate;
    }

    private int count(List<ReviewIssue> issues, Severity severity) {
        return (int) issues.stream().filter(i -> i.getSeverity() == severity).count();
    }
}
