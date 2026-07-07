import { describe, expect, it } from "vitest";

import { CommandPriorityQueue, resolveCommandPriority } from "./queue.js";

describe("resolveCommandPriority", () => {
  it("maps legacy high to p1", () => {
    expect(resolveCommandPriority({ id: "demo:x", meta: { priority: "high" } })).toBe("p1");
  });

  it("defaults undo to p0", () => {
    expect(resolveCommandPriority({ id: "core:undo" })).toBe("p0");
  });
});

describe("CommandPriorityQueue", () => {
  it("drains in priority order with stable tie-breaking", () => {
    const queue = new CommandPriorityQueue();
    queue.enqueue({ id: "demo:b", meta: { priority: "p2" } });
    queue.enqueue({ id: "demo:a", meta: { priority: "p0" } });
    queue.enqueue({ id: "demo:c", meta: { priority: "p2" } });

    expect(queue.drainSorted().map((command) => command.id)).toEqual([
      "demo:a",
      "demo:b",
      "demo:c",
    ]);
  });
});
