import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import path from "node:path";

/**
 * Packs the project source into `public/source-code.zip` so the web app can
 * offer a one-click "download source code" link.
 *
 * Uses `git archive` so the zip always mirrors the committed tree and never
 * leaks untracked secrets (.env is git-ignored, so it is excluded automatically).
 * Editor/agent config and generated archives are filtered out explicitly.
 * Runs automatically on `prebuild`, which Vercel executes before `next build`.
 */
const EXCLUDES = [".kilo", "public/source-code.zip", ".gitattributes"];

const outDir = path.join(process.cwd(), "public");
const outFile = path.join(outDir, "source-code.zip");

try {
  mkdirSync(outDir, { recursive: true });
  execFileSync(
    "git",
    ["archive", "--format=zip", "HEAD", "-o", outFile, ":(exclude).kilo", ":(exclude)public/source-code.zip", ":(exclude).gitattributes"],
    { stdio: "pipe" },
  );
  if (!existsSync(outFile)) throw new Error("git archive produced no output");
  console.log(`✔ Source code packed → public/source-code.zip`);
} catch (err) {
  // Fall back to zip(1) if git is unavailable (e.g. some CI checkouts).
  try {
    execFileSync("zip", ["-r", "-q", outFile, "."], { stdio: "pipe" });
    console.log(`✔ Source code packed (zip fallback) → public/source-code.zip`);
  } catch {
    console.warn(
      "⚠ Could not pack source code (git and zip both unavailable). The download link will 404.",
    );
  }
}
