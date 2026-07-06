import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { createCommandEventRuntime } from "../index.js";
import type { EventEnvelope } from "./types.js";

describe("createCommandEventRuntime public surface", () => {
  it("exports a factory that returns register, dispatch, on, emit, and dispose", () => {
    const runtime = createCommandEventRuntime();

    assert.equal(typeof runtime.register, "function");
    assert.equal(typeof runtime.dispatch, "function");
    assert.equal(typeof runtime.on, "function");
    assert.equal(typeof runtime.emit, "function");
    assert.equal(typeof runtime.dispose, "function");
  });
});

describe("Event Hub", () => {
  it("delivers emitted events to matching listeners", () => {
    const runtime = createCommandEventRuntime();
    const received: EventEnvelope[] = [];

    runtime.on("change", (event) => {
      received.push(event);
    });

    runtime.emit({
      name: "change",
      source: "core",
      timestamp: 1,
      payload: { revision: 1 },
    });

    assert.equal(received.length, 1);
    assert.equal(received[0]?.name, "change");
    assert.equal(received[0]?.source, "core");
    assert.equal(received[0]?.timestamp, 1);
  });

  it("stops delivery after unsubscribe", () => {
    const runtime = createCommandEventRuntime();
    let calls = 0;
    const unsubscribe = runtime.on("change", () => {
      calls += 1;
    });

    unsubscribe();
    runtime.emit({ name: "change", source: "core", timestamp: 2 });

    assert.equal(calls, 0);
  });

  it("can emit pluginError with JSON-serializable payload", () => {
    const runtime = createCommandEventRuntime();
    const received: EventEnvelope[] = [];

    runtime.on("pluginError", (event) => {
      received.push(event);
    });

    const payload = { error: { code: "COMMAND_HANDLER_FAILED", message: "boom" } };
    runtime.emit({
      name: "pluginError",
      source: "plugin",
      timestamp: 3,
      payload,
    });

    assert.equal(received.length, 1);
    assert.equal(received[0]?.name, "pluginError");
    assert.equal(JSON.stringify(received[0]?.payload), JSON.stringify(payload));
  });
});

describe("Command handler registry", () => {
  it("invokes a registered handler exactly once on dispatch", () => {
    const runtime = createCommandEventRuntime();
    let calls = 0;

    runtime.register("demo:ping", () => {
      calls += 1;
    });

    runtime.dispatch({ id: "demo:ping" });

    assert.equal(calls, 1);
  });

  it("uses the latest registered handler for a CommandId", () => {
    const runtime = createCommandEventRuntime();
    const seen: string[] = [];

    runtime.register("demo:ping", () => {
      seen.push("first");
    });
    runtime.register("demo:ping", () => {
      seen.push("second");
    });

    runtime.dispatch({ id: "demo:ping" });

    assert.deepEqual(seen, ["second"]);
  });
});

describe("CommandResult mapping", () => {
  it("returns ok true with value from handler object return", () => {
    const runtime = createCommandEventRuntime();
    runtime.register("demo:ping", () => ({ value: 1 }));

    const result = runtime.dispatch({ id: "demo:ping" });

    assert.equal(result.ok, true);
    assert.equal(result.value, 1);
  });

  it("maps handler false to ok false without throwing", () => {
    const runtime = createCommandEventRuntime();
    runtime.register("demo:ping", () => false);

    const result = runtime.dispatch({ id: "demo:ping" });

    assert.equal(result.ok, false);
    assert.equal(result.error, undefined);
  });

  it("returns core error for unknown commands without throwing", () => {
    const runtime = createCommandEventRuntime();

    const result = runtime.dispatch({ id: "demo:missing" });

    assert.equal(result.ok, false);
    assert.equal(result.error?.source, "core");
    assert.equal(result.error?.code, "COMMAND_UNKNOWN");
  });

  it("ignores meta.priority for execution order", () => {
    const runtime = createCommandEventRuntime();
    const order: string[] = [];

    runtime.register("demo:a", () => {
      order.push("a");
    });
    runtime.register("demo:b", () => {
      order.push("b");
    });

    runtime.dispatch({ id: "demo:a", meta: { priority: "normal" } });
    runtime.dispatch({ id: "demo:b", meta: { priority: "high" } });

    assert.deepEqual(order, ["a", "b"]);
  });
});

describe("Handler error isolation", () => {
  it("maps thrown handler errors to plugin failure results", () => {
    const runtime = createCommandEventRuntime();
    runtime.register("demo:boom", () => {
      throw new Error("boom");
    });

    const result = runtime.dispatch({ id: "demo:boom" });

    assert.equal(result.ok, false);
    assert.equal(result.error?.source, "plugin");
    assert.equal(result.error?.severity, "recoverable");
    assert.equal(result.error?.code, "COMMAND_HANDLER_FAILED");
  });

  it("emits pluginError when a handler throws", () => {
    const runtime = createCommandEventRuntime();
    const received: EventEnvelope[] = [];
    runtime.on("pluginError", (event) => {
      received.push(event);
    });
    runtime.register("demo:boom", () => {
      throw new Error("boom");
    });

    runtime.dispatch({ id: "demo:boom" });

    assert.equal(received.length, 1);
    assert.equal(received[0]?.name, "pluginError");
    assert.equal(received[0]?.source, "plugin");
    assert.ok(received[0]?.payload && typeof received[0].payload === "object");
    assert.ok("error" in (received[0]?.payload as Record<string, unknown>));
  });
});

describe("Disposed runtime", () => {
  it("rejects dispatch after dispose with a core failure", () => {
    const runtime = createCommandEventRuntime();
    let calls = 0;
    runtime.register("demo:ping", () => {
      calls += 1;
    });

    runtime.dispose();
    const result = runtime.dispatch({ id: "demo:ping" });

    assert.equal(result.ok, false);
    assert.equal(result.error?.source, "core");
    assert.equal(result.error?.code, "RUNTIME_DISPOSED");
    assert.equal(calls, 0);
  });

  it("does not deliver events after dispose", () => {
    const runtime = createCommandEventRuntime();
    let calls = 0;
    runtime.on("change", () => {
      calls += 1;
    });

    runtime.dispose();
    runtime.emit({ name: "change", source: "core", timestamp: 1 });

    assert.equal(calls, 0);
  });

  it("allows repeated dispose without throwing", () => {
    const runtime = createCommandEventRuntime();

    runtime.dispose();
    assert.doesNotThrow(() => {
      runtime.dispose();
    });
  });
});
