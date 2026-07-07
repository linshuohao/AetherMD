import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { CoreError } from "../errors.js";
import { loadPluginManifests } from "./manifest.js";
import { mergeCompileSchemas, mergeSecurityLayers } from "./merge.js";
import { createDefaultConflictResolver } from "../editor/conflict-resolver.js";

describe("mergeManifestLayers", () => {
  it("merges compatible schema declarations from multiple plugins", () => {
    const loaded = loadPluginManifests([
      {
        manifest: {
          metadata: { manifestVersion: 1, name: "plugin-a" },
          compile: {
            schema: { type: "node", name: "paragraph", matchMarkdownTag: "p" },
          },
        },
      },
      {
        manifest: {
          metadata: { manifestVersion: 1, name: "plugin-b" },
          compile: {
            schema: { type: "mark", name: "strong", matchMarkdownTag: "strong" },
          },
        },
      },
    ]);

    const merged = mergeCompileSchemas(loaded);
    assert.equal(merged.declarations.length, 2);
    assert.equal(merged.schema.version, 1);
  });

  it("aborts on conflicting schema declarations", () => {
    const loaded = loadPluginManifests([
      {
        manifest: {
          metadata: { manifestVersion: 1, name: "plugin-a" },
          compile: {
            schema: { type: "node", name: "paragraph", matchMarkdownTag: "p" },
          },
        },
      },
      {
        manifest: {
          metadata: { manifestVersion: 1, name: "plugin-b" },
          compile: {
            schema: { type: "node", name: "paragraph", matchMarkdownTag: "div" },
          },
        },
      },
    ]);

    assert.throws(
      () => mergeCompileSchemas(loaded, createDefaultConflictResolver()),
      (error: unknown) => error instanceof CoreError && error.code === "MANIFEST_INVALID",
    );
  });

  it("unions security permission requests", () => {
    const loaded = loadPluginManifests([
      {
        manifest: {
          metadata: { manifestVersion: 1, name: "a" },
          security: { requests: ["perm:clipboard"] },
        },
      },
      {
        manifest: {
          metadata: { manifestVersion: 1, name: "b" },
          security: { requests: ["perm:dom"] },
        },
      },
    ]);

    const requests = mergeSecurityLayers(loaded);
    assert.equal(requests.has("perm:clipboard"), true);
    assert.equal(requests.has("perm:dom"), true);
  });
});
