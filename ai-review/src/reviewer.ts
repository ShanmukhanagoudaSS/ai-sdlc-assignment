import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { ReviewResult, ReviewIssue, IssueCategory, Severity } from "./types";
import { parseDiffStats } from "./utils";

const SYSTEM_PROMPT = `You are an expert code reviewer. You will be given a git diff representing a pull request. Your job is to analyze it thoroughly and return a structured JSON review.

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
      "line": 42 or null,
      "suggestion": "How to fix this"
    }
  ]
}

If there are no issues in a category, omit those issues. If the diff is clean, return an empty issues array.`;

function validateCategory(value: unknown): IssueCategory {
  const valid = Object.values(IssueCategory) as string[];
  if (typeof value === "string" && valid.includes(value)) {
    return value as IssueCategory;
  }
  throw new Error(`Invalid category: ${value}`);
}

function validateSeverity(value: unknown): Severity {
  const valid = Object.values(Severity) as string[];
  if (typeof value === "string" && valid.includes(value)) {
    return value as Severity;
  }
  throw new Error(`Invalid severity: ${value}`);
}

function parseResponse(raw: string, model: string, diff: string): ReviewResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`AI returned invalid JSON. Raw response:\n${raw}`);
  }

  const obj = parsed as Record<string, unknown>;

  if (typeof obj.summary !== "string") {
    throw new Error('AI response missing "summary" string field');
  }

  if (!Array.isArray(obj.issues)) {
    throw new Error('AI response missing "issues" array field');
  }

  const issues: ReviewIssue[] = obj.issues.map((item: unknown) => {
    const issue = item as Record<string, unknown>;
    return {
      category: validateCategory(issue.category),
      severity: validateSeverity(issue.severity),
      title: String(issue.title ?? ""),
      description: String(issue.description ?? ""),
      file: typeof issue.file === "string" ? issue.file : undefined,
      line: typeof issue.line === "number" ? issue.line : undefined,
      suggestion: typeof issue.suggestion === "string" ? issue.suggestion : undefined,
    } satisfies ReviewIssue;
  });

  return {
    summary: obj.summary,
    issues,
    reviewedAt: new Date().toISOString(),
    model,
    diffStats: parseDiffStats(diff),
  };
}

export async function reviewDiff(
  diff: string,
  providerOverride?: string
): Promise<ReviewResult> {
  const provider = providerOverride ?? process.env.AI_PROVIDER ?? "anthropic";
  const userMessage = `Here is the git diff to review:\n\n<diff>\n${diff}\n</diff>`;

  if (provider === "openai") {
    const model = process.env.OPENAI_MODEL ?? "gpt-4o";
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model,
      max_tokens: 4096,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? "";
    return parseResponse(raw, model, diff);
  } else {
    const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";
    const clientOptions: ConstructorParameters<typeof Anthropic>[0] = {
      apiKey: process.env.ANTHROPIC_API_KEY ?? "proxy",
    };
    if (process.env.ANTHROPIC_BASE_URL) {
      clientOptions.baseURL = process.env.ANTHROPIC_BASE_URL;
    }
    const client = new Anthropic(clientOptions);

    const response = await client.messages.create({
      model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const block = response.content[0];
    const raw = block.type === "text" ? block.text : "";
    return parseResponse(raw, model, diff);
  }
}
