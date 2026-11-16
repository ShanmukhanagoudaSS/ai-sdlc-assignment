export enum Severity {
  CRITICAL = "Critical",
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
}

export enum IssueCategory {
  CORRECTNESS = "Correctness",
  SECURITY = "Security",
  CODE_SMELL = "Code Smell",
  MAINTAINABILITY = "Maintainability",
  MISSING_TESTS = "Missing Tests",
  DEPENDENCY = "Dependency",
}

export interface ReviewIssue {
  category: IssueCategory;
  severity: Severity;
  title: string;
  description: string;
  file?: string;
  line?: number;
  suggestion?: string;
}

export interface ReviewResult {
  summary: string;
  issues: ReviewIssue[];
  reviewedAt: string;
  model: string;
  diffStats: {
    filesChanged: number;
    linesAdded: number;
    linesRemoved: number;
  };
}

export enum GateVerdict {
  PASS = "PASS",
  PASS_WITH_REVIEW = "PASS WITH REVIEW",
  BLOCK = "BLOCK",
}

export interface GateResult {
  verdict: GateVerdict;
  reason: string;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}
