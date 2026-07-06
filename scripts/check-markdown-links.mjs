import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SCAN_ROOTS = ["docs", "README.md", "CONTRIBUTING.md", "AGENTS.md"];

const LINK_PATTERN = /\[[^\]]+\]\(([^)]+)\)/g;

function walkMarkdownFiles(directory, files) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      walkMarkdownFiles(fullPath, files);
      continue;
    }
    if (entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
}

function collectMarkdownFiles() {
  const files = [];

  for (const root of SCAN_ROOTS) {
    const absolute = join(REPO_ROOT, root);
    if (!existsSync(absolute)) {
      continue;
    }
    if (statSync(absolute).isFile()) {
      files.push(absolute);
      continue;
    }
    walkMarkdownFiles(absolute, files);
  }

  return files;
}

function isExternalLink(target) {
  return (
    target.startsWith("http://") ||
    target.startsWith("https://") ||
    target.startsWith("mailto:") ||
    target.startsWith("#")
  );
}

function isResolvableRepoLink(target) {
  return target.includes(".") || target.startsWith("./") || target.startsWith("../");
}

function resolveLink(fromFile, target) {
  const withoutFragment = target.split("#")[0] ?? "";
  if (withoutFragment.length === 0) {
    return fromFile;
  }
  return resolve(dirname(fromFile), withoutFragment);
}

function main() {
  const broken = [];

  for (const filePath of collectMarkdownFiles()) {
    const content = readFileSync(filePath, "utf8");
    for (const match of content.matchAll(LINK_PATTERN)) {
      const target = match[1]?.trim();
      if (!target || isExternalLink(target) || !isResolvableRepoLink(target)) {
        continue;
      }

      const resolved = resolveLink(filePath, target);
      if (!existsSync(resolved)) {
        broken.push(
          `${relative(REPO_ROOT, filePath)} → ${target} (resolved: ${relative(REPO_ROOT, resolved)})`,
        );
      }
    }
  }

  if (broken.length > 0) {
    console.error("Broken markdown links:");
    for (const entry of broken) {
      console.error(`- ${entry}`);
    }
    process.exit(1);
  }

  console.log("Markdown link check passed.");
}

main();
