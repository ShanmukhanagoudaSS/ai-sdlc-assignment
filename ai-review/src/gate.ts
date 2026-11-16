import { ReviewResult, GateResult, GateVerdict, Severity } from "./types";

export function applyGate(result: ReviewResult): GateResult {
  const criticalCount = result.issues.filter(
    (i) => i.severity === Severity.CRITICAL
  ).length;
  const highCount = result.issues.filter(
    (i) => i.severity === Severity.HIGH
  ).length;
  const mediumCount = result.issues.filter(
    (i) => i.severity === Severity.MEDIUM
  ).length;
  const lowCount = result.issues.filter(
    (i) => i.severity === Severity.LOW
  ).length;

  let verdict: GateVerdict;
  let reason: string;

  if (criticalCount > 0) {
    verdict = GateVerdict.BLOCK;
    reason = `${criticalCount} Critical issue(s) detected — merge is blocked until resolved.`;
  } else if (highCount > 0) {
    verdict = GateVerdict.PASS_WITH_REVIEW;
    reason = `${highCount} High severity issue(s) require mandatory human review before merging.`;
  } else {
    verdict = GateVerdict.PASS;
    const otherCount = mediumCount + lowCount;
    reason =
      otherCount > 0
        ? `No critical or high severity issues found. Review recommended for ${otherCount} medium/low item(s).`
        : "No issues found. Diff looks clean.";
  }

  return { verdict, reason, criticalCount, highCount, mediumCount, lowCount };
}
