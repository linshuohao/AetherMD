import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { shouldApplyControlledValue } from "../../dist/gate-lock.js";

describe("shouldApplyControlledValue", () => {
  it("returns false when prev and next markdown strings are equal", () => {
    assert.equal(shouldApplyControlledValue("hello", "hello"), false);
    assert.equal(shouldApplyControlledValue("a", "a"), false);
  });

  it("returns true when prev and next markdown strings differ", () => {
    assert.equal(shouldApplyControlledValue("a", "b"), true);
  });

  it("allows first apply when prev is undefined", () => {
    assert.equal(shouldApplyControlledValue(undefined, "x"), true);
  });

  it("returns false when next is undefined", () => {
    assert.equal(shouldApplyControlledValue("a", undefined), false);
  });
});
