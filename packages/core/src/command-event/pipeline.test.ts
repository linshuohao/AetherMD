import { describe, expect, it } from "vitest";

import { createCommandEventRuntime } from "./runtime.js";

describe("Command priority queue batch dispatch", () => {
  it("executes lower P number before higher P number", () => {
    const runtime = createCommandEventRuntime();
    const order: string[] = [];

    runtime.register("demo:a", () => {
      order.push("a");
    });
    runtime.register("demo:b", () => {
      order.push("b");
    });
    runtime.register("demo:c", () => {
      order.push("c");
    });

    runtime.dispatchBatch([
      { id: "demo:b", meta: { priority: "p2" } },
      { id: "demo:c", meta: { priority: "p3" } },
      { id: "demo:a", meta: { priority: "p0" } },
    ]);

    expect(order).toEqual(["a", "b", "c"]);
  });

  it("maps core:undo to p0 in batch ordering", () => {
    const runtime = createCommandEventRuntime();
    const order: string[] = [];

    runtime.register("core:undo", () => {
      order.push("undo");
    });
    runtime.register("demo:late", () => {
      order.push("late");
    });

    runtime.dispatchBatch([{ id: "demo:late", meta: { priority: "p2" } }, { id: "core:undo" }]);

    expect(order).toEqual(["undo", "late"]);
  });
});

describe("Command pipeline guards", () => {
  it("blocks mutating commands when read-only", () => {
    const runtime = createCommandEventRuntime({
      pipeline: { readOnly: true, providedCapabilities: new Set(), grantedPermissions: new Set() },
    });
    let calls = 0;
    runtime.register(
      "demo:mutate",
      () => {
        calls += 1;
      },
      { mutating: true },
    );

    const result = runtime.dispatch({ id: "demo:mutate" });

    expect(result.ok).toBe(false);
    expect(calls).toBe(0);
  });

  it("blocks commands missing required capabilities", () => {
    const runtime = createCommandEventRuntime({
      pipeline: {
        readOnly: false,
        providedCapabilities: new Set(["core:history"]),
        grantedPermissions: new Set(),
      },
    });
    let calls = 0;
    runtime.register(
      "demo:needs-engine",
      () => {
        calls += 1;
      },
      { requires: ["core:engine"] },
    );

    const result = runtime.dispatch({ id: "demo:needs-engine" });

    expect(result.ok).toBe(false);
    expect(calls).toBe(0);
  });

  it("blocks commands missing required permissions", () => {
    const runtime = createCommandEventRuntime({
      pipeline: {
        readOnly: false,
        providedCapabilities: new Set(),
        grantedPermissions: new Set(["perm:dom"]),
      },
    });
    let calls = 0;
    runtime.register(
      "demo:needs-clipboard",
      () => {
        calls += 1;
      },
      { permissions: ["perm:clipboard"] },
    );

    const result = runtime.dispatch({ id: "demo:needs-clipboard" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error?.source).toBe("core");
      expect(result.error?.code).toBe("PERMISSION_DENIED");
    }
    expect(calls).toBe(0);
  });

  it("allows commands when required permissions are granted", () => {
    const runtime = createCommandEventRuntime({
      pipeline: {
        readOnly: false,
        providedCapabilities: new Set(),
        grantedPermissions: new Set(["perm:clipboard"]),
      },
    });
    let calls = 0;
    runtime.register(
      "demo:needs-clipboard",
      () => {
        calls += 1;
      },
      { permissions: ["perm:clipboard"] },
    );

    const result = runtime.dispatch({ id: "demo:needs-clipboard" });

    expect(result.ok).toBe(true);
    expect(calls).toBe(1);
  });
});
