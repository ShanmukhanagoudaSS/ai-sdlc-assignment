#!/usr/bin/env node
import "dotenv/config";
import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { readDiff } from "./utils";
import { reviewDiff } from "./reviewer";
import { applyGate } from "./gate";
import { generateReport } from "./report";
import { GateVerdict } from "./types";

const program = new Command();

program
  .name("ai-review")
  .description("AI-powered pull request code review with intelligent quality gate")
  .version("1.0.0")
  .argument("[diff-file]", "Path to a .diff or .patch file (reads stdin if omitted)")
  .option("-o, --output <path>", "Path to write the HTML report", "review-report.html")
  .option("-p, --provider <name>", 'AI provider: "anthropic" or "openai" (overrides AI_PROVIDER env)')
  .option("--json", "Also write a review.json file alongside the HTML")
  .option("--fail-on-block", "Exit with code 1 if gate verdict is BLOCK (useful for CI)")
  .action(async (diffFile: string | undefined, options: { output: string; provider?: string; json?: boolean; failOnBlock?: boolean }) => {
    try {
      console.log("🔍 Reading diff...");
      const diff = await readDiff(diffFile);

      if (!diff.trim()) {
        console.error("Error: diff is empty. Provide a file path or pipe a diff via stdin.");
        process.exit(1);
      }

      const provider = options.provider ?? process.env.AI_PROVIDER ?? "anthropic";
      console.log(`🤖 Sending to AI for review (provider: ${provider})...`);

      const result = await reviewDiff(diff, provider);

      console.log("✅ Review complete. Analyzing gate...");
      const gate = applyGate(result);

      console.log(`📊 Gate verdict: ${gate.verdict}`);

      const html = generateReport(result, gate);
      const outputPath = path.resolve(options.output);
      fs.writeFileSync(outputPath, html, "utf-8");
      console.log(`📝 Report written to ${outputPath}`);

      if (options.json) {
        const jsonPath = outputPath.replace(/\.html$/, ".json");
        fs.writeFileSync(jsonPath, JSON.stringify({ result, gate }, null, 2), "utf-8");
        console.log(`📄 JSON written to ${jsonPath}`);
      }

      if (options.failOnBlock && gate.verdict === GateVerdict.BLOCK) {
        process.exit(1);
      }
    } catch (err) {
      console.error("Error:", err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

program.parse();
