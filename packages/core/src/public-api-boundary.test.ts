import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import * as core from "./index.js";
import { describe, expect, it } from "vitest";

const forbiddenMorphingExports = [
  "CustomBlockRenderer",
  "MorphingBlockStrategy",
  "MorphingStrategyRegistry",
  "ParseBlockMarkdownPayload",
  "PARSE_BLOCK_MARKDOWN_COMMAND",
  "createMorphingStrategyRegistry",
] as const;

function collectSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(path));
      continue;
    }
    if (
      entry.name.endsWith(".ts") &&
      !entry.name.endsWith(".test.ts") &&
      !entry.name.endsWith(".test-d.ts")
    ) {
      files.push(path);
    }
  }
  return files;
}

describe("core public API boundary", () => {
  for (const exportName of forbiddenMorphingExports) {
    it(`does not export morphing contract symbol ${exportName}`, () => {
      expect(exportName in core).toBe(false);
    });
  }

  it("does not define createMorphingStrategyRegistry in production source", () => {
    const srcRoot = fileURLToPath(new URL(".", import.meta.url));
    const hits = collectSourceFiles(srcRoot).filter((file) =>
      readFileSync(file, "utf8").includes("createMorphingStrategyRegistry"),
    );
    expect(hits).toEqual([]);
  });
});
