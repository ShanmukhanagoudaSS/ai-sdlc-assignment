export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type IssueCategory =
  | 'Correctness'
  | 'Security'
  | 'Code Smell'
  | 'Maintainability'
  | 'Missing Tests'
  | 'Dependency';
export type GateVerdict = 'PASS' | 'PASS WITH REVIEW' | 'BLOCK';
export type InputType = 'diff' | 'github_pr';

export interface ReviewIssue {
  category: IssueCategory;
  severity: Severity;
  title: string;
  description: string;
  file?: string;
  line?: number;
  suggestion?: string;
}

export interface DiffStats {
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
}

export interface ReviewResult {
  summary: string;
  issues: ReviewIssue[];
  reviewedAt: string;
  model: string;
  diffStats: DiffStats;
}

export interface GateResult {
  verdict: GateVerdict;
  reason: string;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export interface ReviewResponse {
  result: ReviewResult;
  gate: GateResult;
}

export interface ReviewRequest {
  input: string;
  inputType: InputType;
}
