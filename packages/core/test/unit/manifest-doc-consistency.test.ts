import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { SUPPORTED_MANIFEST_VERSIONS } from "../../dist/manifest.js";

const OFFICIAL_PACKAGE_SRC_DIRS = [
  "packages/plugins/plugin-remark/src",
  "packages/plugins/plugin-prosemirror/src",
  "packages/preset-gfm/src",
  "packages/react/src",
] as const;

const STABLE_MANIFEST_VERSION_ROW = /^\|\s*`(\d+)`\s*\|\s*\*\*Stable\*\*\s*\|/gm;

const MANIFEST_VERSION_LITERAL = /manifestVersion:\s*(\d+)/g;

function repoRootFromTestFile(importMetaUrl: string): string {
  return join(dirname(fileURLToPath(importMetaUrl)), "..", "..", "..", "..");
}

function parseStableManifestVersions(markdown: string): number[] {
  const versions: number[] = [];

  for (const match of markdown.matchAll(STABLE_MANIFEST_VERSION_ROW)) {
    versions.push(Number(match[1]));
  }

  return versions.sort((left, right) => left - right);
}

function listTypeScriptSourceFiles(directory: string): string[] {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...listTypeScriptSourceFiles(entryPath));
      continue;
    }

    if (entry.isFile() && /\.tsx?$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

function collectOfficialManifestVersions(repoRoot: string): number[] {
  const versions = new Set<number>();

  for (const srcDir of OFFICIAL_PACKAGE_SRC_DIRS) {
    const absoluteSrcDir = join(repoRoot, srcDir);

    for (const filePath of listTypeScriptSourceFiles(absoluteSrcDir)) {
      const source = readFileSync(filePath, "utf8");

      for (const match of source.matchAll(MANIFEST_VERSION_LITERAL)) {
        versions.add(Number(match[1]));
      }
    }
  }

  return [...versions].sort((left, right) => left - right);
}

function isSupportedManifestVersion(
  version: number,
): version is (typeof SUPPORTED_MANIFEST_VERSIONS)[number] {
  return (SUPPORTED_MANIFEST_VERSIONS as readonly number[]).includes(version);
}

describe("manifest documentation consistency", () => {
  it("matches Stable versions in docs/sdk/manifest.md", () => {
    const repoRoot = repoRootFromTestFile(import.meta.url);
    const manifestDocPath = join(repoRoot, "docs", "sdk", "manifest.md");
    const markdown = readFileSync(manifestDocPath, "utf8");
    const docVersions = parseStableManifestVersions(markdown);
    const supportedVersions = [...SUPPORTED_MANIFEST_VERSIONS].sort((left, right) => left - right);

    assert.deepEqual(
      docVersions,
      supportedVersions,
      "docs/sdk/manifest.md Stable rows must match SUPPORTED_MANIFEST_VERSIONS",
    );
  });

  it("official packages use supported manifestVersion", () => {
    const repoRoot = repoRootFromTestFile(import.meta.url);
    const officialVersions = collectOfficialManifestVersions(repoRoot);

    assert.notEqual(
      officialVersions.length,
      0,
      "expected at least one manifestVersion in official package sources",
    );

    for (const version of officialVersions) {
      assert.equal(
        isSupportedManifestVersion(version),
        true,
        `manifestVersion ${version} is not in SUPPORTED_MANIFEST_VERSIONS`,
      );
    }
  });
});
