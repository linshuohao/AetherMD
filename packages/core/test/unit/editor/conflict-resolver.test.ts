import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createDefaultConflictResolver } from "../../../dist/editor/conflict-resolver.js";

describe("createDefaultConflictResolver", () => {
  it("resolves duplicate command conflicts with last-wins", () => {
    const resolver = createDefaultConflictResolver();
    const result = resolver.resolve({
      type: "command",
      existing: { value: "handler-a" },
      incoming: { value: "handler-b" },
    });

    assert.equal(result.strategy, "last-wins");
    assert.equal(result.winner, "handler-b");
    assert.equal(result.warn, true);
  });

  it("aborts schema conflicts without selecting a winner", () => {
    const resolver = createDefaultConflictResolver();
    const result = resolver.resolve({
      type: "schema",
      existing: { value: { version: 1 } },
      incoming: { value: { version: 2 } },
    });

    assert.equal(result.strategy, "abort");
    assert.equal(result.winner, undefined);
    assert.equal(result.warn, true);
  });
});
