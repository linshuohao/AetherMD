import { type AetherBlock } from "@aether-md/core/document";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

import type { CustomBlockRenderer } from "./contracts.js";
import { RenderedBlockHost } from "./rendered-block-host.js";

const block: AetherBlock = {
  type: "paragraph",
  children: [{ type: "text", text: "hello" }],
};

describe("RenderedBlockHost", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders fallback view when interactive renderer mount throws", async () => {
    const renderer: CustomBlockRenderer = {
      mount() {
        throw new Error("boom");
      },
    };

    const wrapper = mount(RenderedBlockHost, {
      props: { block, renderer, onFocus: () => {} },
      attachTo: document.body,
    });
    await flushPromises();

    assert.equal(wrapper.get('[data-testid="morphing-render-fallback"]').text(), "boom");
    assert.equal(
      wrapper.get('[data-testid="morphing-render-fallback"]').attributes("role"),
      "alert",
    );

    wrapper.unmount();
  });

  it("mounts renderer when mount succeeds", async () => {
    const renderer: CustomBlockRenderer = {
      mount(container) {
        container.textContent = "mounted";
      },
    };

    const wrapper = mount(RenderedBlockHost, {
      props: { block, renderer, onFocus: () => {} },
      attachTo: document.body,
    });
    await flushPromises();

    assert.equal(wrapper.get('[data-testid="morphing-rendered"]').text(), "mounted");

    wrapper.unmount();
  });

  it("calls update instead of remounting when block data changes with same identity", async () => {
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

    const wrapper = mount(RenderedBlockHost, {
      props: { block: initialBlock, renderer, onFocus: () => {} },
      attachTo: document.body,
    });
    await flushPromises();

    assert.equal(mountCount, 1);
    assert.equal(updateCount, 0);
    assert.equal(wrapper.get('[data-testid="morphing-rendered"]').text(), "hello");

    const updatedBlock: AetherBlock = {
      id: "block-1",
      type: "paragraph",
      children: [{ type: "text", text: "world" }],
    };

    await wrapper.setProps({ block: updatedBlock });
    await flushPromises();

    assert.equal(mountCount, 1);
    assert.equal(updateCount, 1);
    assert.equal(wrapper.get('[data-testid="morphing-rendered"]').text(), "world");

    wrapper.unmount();
  });

  it("remounts when block identity changes", async () => {
    let mountCount = 0;
    const renderer: CustomBlockRenderer = {
      mount(container, blockData) {
        mountCount += 1;
        const typed = blockData as AetherBlock;
        container.textContent = typed.id ?? typed.type;
      },
    };

    const initialBlock: AetherBlock = {
      id: "block-1",
      type: "paragraph",
      children: [{ type: "text", text: "hello" }],
    };

    const wrapper = mount(RenderedBlockHost, {
      props: { block: initialBlock, renderer, onFocus: () => {} },
      attachTo: document.body,
    });
    await flushPromises();

    assert.equal(mountCount, 1);
    assert.equal(wrapper.get('[data-testid="morphing-rendered"]').text(), "block-1");

    await wrapper.setProps({
      block: {
        id: "block-2",
        type: "paragraph",
        children: [{ type: "text", text: "hello" }],
      },
    });
    await flushPromises();

    assert.equal(mountCount, 2);
    assert.equal(wrapper.get('[data-testid="morphing-rendered"]').text(), "block-2");

    wrapper.unmount();
  });
});
