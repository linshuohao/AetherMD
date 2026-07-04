import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as core from "./index.js";

describe("@aether-md/core M1 package boundary", () => {
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

  it("does not expose later milestone runtime APIs", () => {
    const exportedKeys = Object.keys(core);
    const commandBus = ["Command", "Bus"].join("");
    const eventHub = ["Event", "Hub"].join("");
    const adapter = ["Ada", "pter"].join("");

    assert.equal(exportedKeys.includes("createEditor"), false);
    assert.equal(exportedKeys.includes(commandBus), false);
    assert.equal(exportedKeys.includes(eventHub), false);
    assert.equal(exportedKeys.includes(adapter), false);
  });
});
