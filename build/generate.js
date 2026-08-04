// SeniorSafetyMarket static-page generator — entry point.
//
// Phase 1: no-op skeleton. Confirms Node + the GitHub Actions workflow can run this file
// successfully before any real generation logic (listing/category/city pages) is added in
// later phases. Writes a small marker file into dist/ so a deploy smoke test has something
// real to check for.

import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");

function main() {
  mkdirSync(DIST, { recursive: true });
  writeFileSync(
    path.join(DIST, "generator-status.txt"),
    `SeniorSafetyMarket generator skeleton ran successfully at ${new Date().toISOString()}\n`,
    "utf-8"
  );
  console.log("SeniorSafetyMarket build: skeleton run complete, wrote dist/generator-status.txt");
}

main();
