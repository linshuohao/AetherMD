import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import React from "react";

import { AetherEditorRoot, AetherMorphingDocument } from "../index.js";
import { SLICE_D_FIXTURE, queryBlock } from "../testing/morphing-fixtures.js";
import { createGfmEditorPlugins } from "../testing/gfm-plugins.js";

describe("Slice D list block morphing (block-morphing-slice-d)", () => {
  afterEach(() => {
    cleanup();
  });

  it("scenario D1: focused list block shows Markdown list source", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_D_FIXTURE,
          onChange: () => {},
        },
        React.createElement(AetherMorphingDocument),
      ),
    );

    await waitFor(() => {
      assert.ok(document.querySelector('[data-testid="morphing-block-1"]'));
    });

    const listBlock = queryBlock(1);
    assert.equal(listBlock.getAttribute("data-block-type"), "list");

    const renderedList = listBlock.querySelector(
      '[data-testid="morphing-rendered"]',
    ) as HTMLElement;

    await act(async () => {
      fireEvent.focus(renderedList);
    });

    await waitFor(() => {
      const source = listBlock.querySelector(
        '[data-testid="morphing-source"]',
      ) as HTMLTextAreaElement | null;
      assert.ok(source);
      assert.match(source.value, /^- alpha/);
      assert.match(source.value, /- beta/);
    });

    const introBlock = queryBlock(0);
    assert.ok(introBlock.querySelector('[data-testid="morphing-rendered"]'));
    assert.equal(introBlock.querySelector('[data-testid="morphing-source"]'), null);
  });

  it("scenario D2: blurred list block renders ul/li typography", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_D_FIXTURE,
          onChange: () => {},
        },
        React.createElement(AetherMorphingDocument),
      ),
    );

    await waitFor(() => {
      const listBlock = queryBlock(1);
      assert.ok(listBlock.querySelector("ul"));
      assert.equal(listBlock.querySelectorAll("li").length, 2);
    });
  });

  it("scenario D3: editing list source updates serialized markdown", async () => {
    let latestMarkdown = SLICE_D_FIXTURE;

    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_D_FIXTURE,
          onChange: (next: string) => {
            latestMarkdown = next;
          },
        },
        React.createElement(AetherMorphingDocument),
      ),
    );

    await waitFor(() => {
      assert.ok(document.querySelector('[data-testid="morphing-block-1"]'));
    });

    const listBlock = queryBlock(1);
    const renderedList = listBlock.querySelector(
      '[data-testid="morphing-rendered"]',
    ) as HTMLElement;

    await act(async () => {
      fireEvent.focus(renderedList);
    });

    await waitFor(() => {
      assert.ok(listBlock.querySelector('[data-testid="morphing-source"]'));
    });

    const source = listBlock.querySelector(
      '[data-testid="morphing-source"]',
    ) as HTMLTextAreaElement;

    await act(async () => {
      fireEvent.change(source, {
        target: { value: "- one\n- two\n- three" },
      });
    });

    await waitFor(() => {
      assert.match(latestMarkdown, /- one/);
      assert.match(latestMarkdown, /- three/);
      assert.match(latestMarkdown, /Intro paragraph/);
    });
  });

  it("scenario D4: only list block in source during Block Focus", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_D_FIXTURE,
          onChange: () => {},
        },
        React.createElement(AetherMorphingDocument),
      ),
    );

    await waitFor(() => {
      assert.ok(document.querySelector('[data-testid="morphing-block-1"]'));
    });

    const listBlock = queryBlock(1);
    await act(async () => {
      fireEvent.focus(listBlock.querySelector('[data-testid="morphing-rendered"]') as HTMLElement);
    });

    await waitFor(() => {
      assert.equal(document.querySelectorAll('[data-testid="morphing-source"]').length, 1);
    });
  });
});
