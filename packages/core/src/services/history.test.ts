import { describe, expect, it } from "vitest";

import { createDocumentHistory } from "./history.js";

const doc = (text: string) => ({
  type: "doc" as const,
  children: [{ type: "paragraph" as const, children: [{ type: "text" as const, text }] }],
});

describe("createDocumentHistory", () => {
  it("captures and undoes to previous document", () => {
    const history = createDocumentHistory();
    const before = doc("hello");
    const after = doc("world");

    history.captureBefore(before);
    expect(history.canUndo()).toBe(true);

    const restored = history.undo(after);
    expect(restored).toEqual(before);
    expect(history.canRedo()).toBe(true);
  });

  it("redoes after undo", () => {
    const history = createDocumentHistory();
    const before = doc("a");
    const after = doc("b");

    history.captureBefore(before);
    history.undo(after);
    const redone = history.redo(before);
    expect(redone).toEqual(after);
  });

  it("clears redo stack on new capture", () => {
    const history = createDocumentHistory();
    history.captureBefore(doc("1"));
    history.undo(doc("2"));
    expect(history.canRedo()).toBe(true);

    history.captureBefore(doc("3"));
    expect(history.canRedo()).toBe(false);
  });
});
