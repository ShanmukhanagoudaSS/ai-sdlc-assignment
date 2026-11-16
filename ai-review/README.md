# ai-review

AI-powered pull request code review with an intelligent quality gate. Accepts a git diff, sends it to an AI model, and outputs a self-contained HTML report with severity-filtered issue tables.

## Installation

```bash
cd ai-review
npm install
```

## Setup

```bash
cp .env.example .env
# Edit .env and add your API key
```

Required variables:
- `ANTHROPIC_API_KEY` — if using Anthropic (default)
- `OPENAI_API_KEY` — if using OpenAI

## Usage

**Review a diff file:**
```bash
npx ts-node src/cli.ts examples/sample.diff
```

**Review from stdin (pipe git diff):**
```bash
git diff HEAD | npx ts-node src/cli.ts
```

**Custom output path + CI fail-on-block:**
```bash
npx ts-node src/cli.ts examples/sample.diff -o my-report.html --fail-on-block
```

**Also export raw JSON:**
```bash
npx ts-node src/cli.ts examples/sample.diff --json
```

**Built binary (after `npm run build`):**
```bash
node dist/cli.js examples/sample.diff -o report.html
```

## Quality Gate

| Issues Found | Verdict |
|---|---|
| Any **Critical** issue | `BLOCK` — merge prevented |
| Any **High** issue (no Critical) | `PASS WITH REVIEW` — human review required |
| Only Medium/Low, or none | `PASS` — safe to merge |

Use `--fail-on-block` in CI pipelines to fail the build when the verdict is `BLOCK`.

## Switching Providers

Set `AI_PROVIDER` in `.env` or pass `-p` at the CLI:

```bash
# Use OpenAI
AI_PROVIDER=openai npx ts-node src/cli.ts examples/sample.diff

# Or override at runtime
npx ts-node src/cli.ts examples/sample.diff -p openai
```

## Options

```
Arguments:
  diff-file              Path to a .diff or .patch file (optional)

Options:
  -o, --output <path>    Output HTML path (default: review-report.html)
  -p, --provider <name>  AI provider: anthropic or openai
  --json                 Also write review.json alongside the HTML
  --fail-on-block        Exit code 1 if verdict is BLOCK
  -v, --version          Show version
  -h, --help             Show help
```
