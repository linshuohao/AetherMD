import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { AetherBlock } from "@aether-md/core";

import type { CustomBlockRenderer } from "./contracts.js";
import { RenderedBlockHost } from "./rendered-block-host.js";

const block: AetherBlock = {
  type: "paragraph",
  children: [{ type: "text", text: "hello" }],
};

describe("RenderedBlockHost", () => {
  it("renders fallback view when interactive renderer mount throws", () => {
    const renderer: CustomBlockRenderer = {
      mount() {
        throw new Error("boom");
      },
    };

    render(<RenderedBlockHost block={block} renderer={renderer} onFocus={() => {}} />);

    assert.equal(screen.getByTestId("morphing-render-fallback").textContent, "boom");
  });

  it("mounts renderer when mount succeeds", () => {
    const renderer: CustomBlockRenderer = {
      mount(container) {
        container.textContent = "mounted";
      },
    };

    render(<RenderedBlockHost block={block} renderer={renderer} onFocus={() => {}} />);

    assert.equal(screen.getByTestId("morphing-rendered").textContent, "mounted");
  });
});
