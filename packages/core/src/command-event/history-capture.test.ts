import { describe, expect, it, vi } from "vitest";

import { createCommandEventRuntime } from "./runtime.js";
import { shouldCaptureHistory } from "./pipeline.js";
import type { CommandRequest } from "./types.js";

describe("shouldCaptureHistory", () => {
  it("returns true for mutating commands by registration meta", () => {
    expect(shouldCaptureHistory({ id: "demo:mutate" }, { mutating: true })).toBe(true);
  });

  it("returns true for known mutating command ids", () => {
    expect(shouldCaptureHistory({ id: "core:replaceText" })).toBe(true);
  });

  it("returns false when meta.history is skip", () => {
    expect(
      shouldCaptureHistory(
        { id: "core:replaceText", meta: { history: "skip" } },
        { mutating: true },
      ),
    ).toBe(false);
  });

  it("returns false for non-mutating commands", () => {
    expect(shouldCaptureHistory({ id: "demo:read" }, { mutating: false })).toBe(false);
  });
});

describe("HistoryCapture middleware", () => {
  it("captures after successful mutating command dispatch", () => {
    const onHistoryCapture = vi.fn<(command: CommandRequest) => void>();
    const runtime = createCommandEventRuntime({ onHistoryCapture });
    runtime.register(
      "demo:mutate",
      () => {
        return { value: "done" };
      },
      { mutating: true },
    );

    const result = runtime.dispatch({ id: "demo:mutate" });

    expect(result.ok).toBe(true);
    expect(onHistoryCapture).toHaveBeenCalledTimes(1);
    expect(onHistoryCapture).toHaveBeenCalledWith({ id: "demo:mutate" });
  });

  it("does not capture for non-mutating commands", () => {
    const onHistoryCapture = vi.fn<(command: CommandRequest) => void>();
    const runtime = createCommandEventRuntime({ onHistoryCapture });
    runtime.register(
      "demo:read",
      () => {
        return { value: "ok" };
      },
      { mutating: false },
    );

    const result = runtime.dispatch({ id: "demo:read" });

    expect(result.ok).toBe(true);
    expect(onHistoryCapture).not.toHaveBeenCalled();
  });

  it("does not capture when handler returns failure", () => {
    const onHistoryCapture = vi.fn<(command: CommandRequest) => void>();
    const runtime = createCommandEventRuntime({ onHistoryCapture });
    runtime.register("demo:mutate", () => false, { mutating: true });

    const result = runtime.dispatch({ id: "demo:mutate" });

    expect(result.ok).toBe(false);
    expect(onHistoryCapture).not.toHaveBeenCalled();
  });

  it("does not capture when handler throws", () => {
    const onHistoryCapture = vi.fn<(command: CommandRequest) => void>();
    const runtime = createCommandEventRuntime({ onHistoryCapture });
    runtime.register(
      "demo:mutate",
      () => {
        throw new Error("boom");
      },
      { mutating: true },
    );

    const result = runtime.dispatch({ id: "demo:mutate" });

    expect(result.ok).toBe(false);
    expect(onHistoryCapture).not.toHaveBeenCalled();
  });

  it("does not capture when pipeline guard blocks dispatch", () => {
    const onHistoryCapture = vi.fn<(command: CommandRequest) => void>();
    const runtime = createCommandEventRuntime({
      onHistoryCapture,
      pipeline: { readOnly: true, providedCapabilities: new Set(), grantedPermissions: new Set() },
    });
    runtime.register(
      "demo:mutate",
      () => {
        return { value: "done" };
      },
      { mutating: true },
    );

    const result = runtime.dispatch({ id: "demo:mutate" });

    expect(result.ok).toBe(false);
    expect(onHistoryCapture).not.toHaveBeenCalled();
  });

  it("accepts onHistoryCapture via pipeline context", () => {
    const onHistoryCapture = vi.fn<(command: CommandRequest) => void>();
    const runtime = createCommandEventRuntime({
      pipeline: {
        readOnly: false,
        providedCapabilities: new Set(),
        grantedPermissions: new Set(),
        onHistoryCapture,
      },
    });
    runtime.register("demo:mutate", () => true, { mutating: true });

    runtime.dispatch({ id: "demo:mutate" });

    expect(onHistoryCapture).toHaveBeenCalledTimes(1);
  });
});
