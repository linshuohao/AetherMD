import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import React from "react";

import type { AetherEditor } from "@aether-md/core";

import { AetherEditorRoot, AetherMorphingDocument } from "../index.js";
import { EditorCapture, MULTI_BLOCK_FOCUS_FIXTURE } from "../testing/morphing-fixtures.js";
import { createGfmEditorPlugins } from "../testing/gfm-plugins.js";

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
          value: MULTI_BLOCK_FOCUS_FIXTURE,
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
          value: MULTI_BLOCK_FOCUS_FIXTURE,
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

  it("preserves Block Focus after in-session moveBlock reorder", async () => {
    let capturedEditor: AetherEditor | null = null;

    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: MULTI_BLOCK_FOCUS_FIXTURE,
          onChange: () => {},
        },
        React.createElement(
          React.Fragment,
          null,
          React.createElement(EditorCapture, {
            onReady: (editor) => {
              capturedEditor = editor;
            },
          }),
          React.createElement(AetherMorphingDocument),
        ),
      ),
    );

    await waitFor(() => {
      assert.ok(capturedEditor);
      assert.equal(document.querySelectorAll("[data-block-id]").length, 3);
    });

    const middleBlock = document.querySelectorAll("[data-block-id]")[1] as HTMLElement;
    const middleBlockId = middleBlock.getAttribute("data-block-id");
    assert.ok(middleBlockId);

    const rendered = middleBlock.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;

    await act(async () => {
      fireEvent.focus(rendered);
    });

    await waitFor(() => {
      assert.ok(document.querySelector(`[data-block-id="${middleBlockId}"][data-focused="true"]`));
    });

    const result = await capturedEditor!.dispatch({
      id: "core:moveBlock",
      payload: { blockId: middleBlockId, toIndex: 2 },
    });
    assert.equal(result.ok, true);

    await waitFor(() => {
      const blocks = [...document.querySelectorAll("[data-block-id]")];
      assert.equal(blocks[2]?.getAttribute("data-block-id"), middleBlockId);
      assert.ok(document.querySelector(`[data-block-id="${middleBlockId}"][data-focused="true"]`));
    });
  });
});
