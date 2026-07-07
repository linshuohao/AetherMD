import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { RenderError, SerializationError, toSerializationError } from "./errors.js";

describe("RenderError", () => {
  it("uses render source and degraded severity", () => {
    const error = new RenderError({
      code: "RENDER_MOUNT_FAILED",
      message: "mount failed",
    });

    assert.equal(error.source, "render");
    assert.equal(error.severity, "degraded");
    assert.equal(error.code, "RENDER_MOUNT_FAILED");
  });
});

describe("toSerializationError", () => {
  it("returns SerializationError instances unchanged", () => {
    const original = new SerializationError({
      code: "UNSUPPORTED_NODE",
      message: "unsupported",
    });

    assert.equal(toSerializationError(original), original);
  });

  it("wraps unknown errors as SERIALIZE_FAILED", () => {
    const wrapped = toSerializationError(new Error("broken"));

    assert.equal(wrapped instanceof SerializationError, true);
    assert.equal(wrapped.code, "SERIALIZE_FAILED");
    assert.equal(wrapped.message, "broken");
  });
});
