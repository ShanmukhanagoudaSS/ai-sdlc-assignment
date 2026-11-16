import * as fs from "fs";
import * as readline from "readline";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function readDiff(filePath?: string): Promise<string> {
  if (filePath) {
    return fs.readFileSync(filePath, "utf-8");
  }

  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({ input: process.stdin });
    const lines: string[] = [];
    rl.on("line", (line) => lines.push(line));
    rl.on("close", () => resolve(lines.join("\n")));
    rl.on("error", reject);
  });
}

export async function runGitDiff(): Promise<string> {
  const { stdout } = await execAsync("git diff HEAD");
  return stdout;
}

export function parseDiffStats(diff: string): {
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
} {
  const lines = diff.split("\n");
  const fileHeaders = new Set<string>();
  let linesAdded = 0;
  let linesRemoved = 0;

  for (const line of lines) {
    if (line.startsWith("+++ ") && !line.startsWith("+++ /dev/null")) {
      fileHeaders.add(line.slice(4));
    } else if (line.startsWith("---")) {
      // skip --- file header
    } else if (line.startsWith("+++")) {
      // skip +++ file header (already handled above or /dev/null)
    } else if (line.startsWith("+")) {
      linesAdded++;
    } else if (line.startsWith("-")) {
      linesRemoved++;
    }
  }

  return {
    filesChanged: fileHeaders.size,
    linesAdded,
    linesRemoved,
  };
}
