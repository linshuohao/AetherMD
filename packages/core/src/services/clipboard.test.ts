import { describe, expect, it } from "vitest";

import { createClipboardService } from "./clipboard.js";

describe("createClipboardService", () => {
  it("stores and reads copied text", () => {
    const clipboard = createClipboardService();
    clipboard.copy("hello");
    expect(clipboard.read()).toBe("hello");
    expect(clipboard.paste()).toBe("hello");
  });

  it("clears buffer", () => {
    const clipboard = createClipboardService();
    clipboard.copy("x");
    clipboard.clear();
    expect(clipboard.read()).toBe("");
  });
});
