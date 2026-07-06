import "./test-setup.js";

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import React from "react";

import { AetherEditorRoot, AetherMorphingDocument } from "./index.js";
import { SLICE_C_FIXTURE } from "./block-morphing-test-helpers.js";
import { createGfmEditorPlugins } from "./test-helpers.js";

describe("Block stable identity (block-identity)", () => {
  afterEach(() => {
    cleanup();
  });

  it("exposes stable data-block-id on morphing surfaces", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_C_FIXTURE,
          onChange: () => {},
        },
        React.createElement(AetherMorphingDocument),
      ),
    );

    await waitFor(() => {
      const blocks = document.querySelectorAll("[data-block-id]");
      assert.equal(blocks.length, 3);
    });

    const ids = [...document.querySelectorAll("[data-block-id]")].map((node) =>
      node.getAttribute("data-block-id"),
    );
    assert.equal(new Set(ids).size, 3);
    for (const id of ids) {
      assert.match(id ?? "", /^blk_/);
    }
  });

  it("routes Block Focus by block id, not array index", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_C_FIXTURE,
          onChange: () => {},
        },
        React.createElement(AetherMorphingDocument),
      ),
    );

    await waitFor(() => {
      assert.ok(document.querySelectorAll('[data-testid="morphing-rendered"]').length >= 2);
    });

    const middleBlock = document.querySelectorAll("[data-block-id]")[1] as HTMLElement;
    const middleBlockId = middleBlock.getAttribute("data-block-id");
    assert.ok(middleBlockId);

    const rendered = middleBlock.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;

    await act(async () => {
      fireEvent.focus(rendered);
    });

    await waitFor(() => {
      const focused = document.querySelector(
        `[data-block-id="${middleBlockId}"][data-focused="true"]`,
      );
      assert.ok(focused);
      assert.ok(focused?.querySelector('[data-testid="morphing-source"]'));
    });
  });
});
