import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as core from "./index.js";

describe("@aether-md/core package boundary", () => {
  it("exposes the M1 bootstrap runtime surface", () => {
    assert.deepEqual(core.SUPPORTED_MANIFEST_VERSIONS, [1]);
    assert.equal(typeof core.CoreError, "function");
    assert.equal(typeof core.bootstrapCore, "function");
    assert.deepEqual(core.M1_CORE_CAPABILITIES, [
      "core:history",
      "core:selection",
      "core:clipboard",
      "core:assets",
    ]);
  });

  it("exposes the M2 command-event runtime surface", () => {
    assert.equal(typeof core.createCommandEventRuntime, "function");
    assert.equal(typeof core.PluginError, "function");
  });

  it("does not expose later milestone runtime APIs", () => {
    const exportedKeys = Object.keys(core);

    assert.equal(exportedKeys.includes("createEditor"), false);
    assert.equal(exportedKeys.includes("parseMarkdown"), false);
    assert.equal(exportedKeys.includes("serializeMarkdown"), false);
    assert.equal(exportedKeys.includes("getMarkdown"), false);
    assert.equal(exportedKeys.includes("getDocument"), false);
    assert.equal(exportedKeys.includes("createAdapter"), false);
    assert.equal(exportedKeys.includes("ReactEditor"), false);
    assert.equal(exportedKeys.includes("remarkPlugin"), false);
    assert.equal(exportedKeys.includes("prosemirrorPlugin"), false);
    assert.equal(exportedKeys.includes("presetGfm"), false);
  });
});
