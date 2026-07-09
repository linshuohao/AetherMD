import { type AetherBlock } from "@aether-md/core/document";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import type { CustomBlockRenderer } from "./contracts.js";
import { RenderedBlockHost } from "./rendered-block-host.js";

const block: AetherBlock = {
  type: "paragraph",
  children: [{ type: "text", text: "hello" }],
};

describe("RenderedBlockHost", () => {
  afterEach(() => {
    cleanup();
  });

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

  it("calls update instead of remounting when block data changes with same identity", () => {
    let mountCount = 0;
    let updateCount = 0;
    let container: HTMLElement | null = null;

    const renderer: CustomBlockRenderer = {
      mount(domContainer, blockData) {
        mountCount += 1;
        container = domContainer;
        const typed = blockData as AetherBlock;
        domContainer.textContent =
          typed.children?.[0]?.type === "text" ? typed.children[0].text : "";
      },
      update(newBlockData) {
        updateCount += 1;
        const typed = newBlockData as AetherBlock;
        if (container) {
          container.textContent =
            typed.children?.[0]?.type === "text" ? typed.children[0].text : "";
        }
      },
    };

    const initialBlock: AetherBlock = {
      id: "block-1",
      type: "paragraph",
      children: [{ type: "text", text: "hello" }],
    };

    const { rerender } = render(
      <RenderedBlockHost block={initialBlock} renderer={renderer} onFocus={() => {}} />,
    );

    assert.equal(mountCount, 1);
    assert.equal(updateCount, 0);
    assert.equal(screen.getByTestId("morphing-rendered").textContent, "hello");

    const updatedBlock: AetherBlock = {
      id: "block-1",
      type: "paragraph",
      children: [{ type: "text", text: "world" }],
    };

    rerender(<RenderedBlockHost block={updatedBlock} renderer={renderer} onFocus={() => {}} />);

    assert.equal(mountCount, 1);
    assert.equal(updateCount, 1);
    assert.equal(screen.getByTestId("morphing-rendered").textContent, "world");
  });
});
