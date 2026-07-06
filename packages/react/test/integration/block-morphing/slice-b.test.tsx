import "../../setup.js";

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import React from "react";

import {
  AetherEditorRoot,
  AetherMorphingContent,
  AetherMorphingDocument,
} from "../../../dist/index.js";
import { SLICE_B_FIXTURE, queryBlock } from "../../helpers/morphing-fixtures.js";
import { createGfmEditorPlugins } from "../../helpers/gfm-plugins.js";

describe("Slice B GFM inline marks (block-morphing-slice-b)", () => {
  afterEach(() => {
    cleanup();
  });

  it("scenario B1: focused block shows emphasis and link Markdown sigils", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_B_FIXTURE,
          onChange: () => {},
        },
        React.createElement(AetherMorphingContent),
      ),
    );

    await waitFor(() => {
      assert.ok(document.querySelector('[data-testid="morphing-rendered"]'));
    });

    const rendered = document.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;

    await act(async () => {
      fireEvent.focus(rendered);
    });

    await waitFor(() => {
      const source = document.querySelector(
        '[data-testid="morphing-source"]',
      ) as HTMLTextAreaElement | null;
      assert.ok(source);
      assert.match(source.value, /\*emphasis\*/);
      assert.match(source.value, /\[link\]\(https:\/\/example\.com\)/);
    });
  });

  it("scenario B2: blurred block renders emphasis as em element", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_B_FIXTURE,
          onChange: () => {},
        },
        React.createElement(AetherMorphingContent),
      ),
    );

    await waitFor(() => {
      const rendered = document.querySelector(
        '[data-testid="morphing-rendered"]',
      ) as HTMLElement | null;
      assert.ok(rendered);
      assert.ok(rendered.querySelector("strong"));
      assert.ok(rendered.querySelector("em"));
      assert.ok(rendered.querySelector('a[href="https://example.com"]'));
      assert.doesNotMatch(rendered.textContent ?? "", /\*emphasis\*/);
    });
  });

  it("scenario B3: source edit of emphasis does not strip inline marks", async () => {
    let latestMarkdown = SLICE_B_FIXTURE;

    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: SLICE_B_FIXTURE,
          onChange: (next: string) => {
            latestMarkdown = next;
          },
        },
        React.createElement(AetherMorphingContent),
      ),
    );

    await waitFor(() => {
      assert.ok(document.querySelector('[data-testid="morphing-rendered"]'));
    });

    const rendered = document.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;

    await act(async () => {
      fireEvent.focus(rendered);
    });

    await waitFor(() => {
      assert.ok(document.querySelector('[data-testid="morphing-source"]'));
    });

    const source = document.querySelector('[data-testid="morphing-source"]') as HTMLTextAreaElement;

    await act(async () => {
      fireEvent.change(source, {
        target: {
          value: "Hello **bold** and *universe* with [link](https://example.com).",
        },
      });
    });

    await waitFor(() => {
      assert.match(latestMarkdown, /\*universe\*/);
      assert.match(latestMarkdown, /\[link\]\(https:\/\/example\.com\)/);
    });

    await act(async () => {
      fireEvent.blur(source);
    });

    await waitFor(() => {
      const renderedAfter = document.querySelector(
        '[data-testid="morphing-rendered"]',
      ) as HTMLElement | null;
      assert.ok(renderedAfter);
      assert.ok(renderedAfter.querySelector("em"));
      assert.equal(renderedAfter.querySelector("em")?.textContent, "universe");
    });
  });

  it("multi-block smoke: emphasis paragraph in AetherMorphingDocument", async () => {
    const fixture = "Plain intro\n\nA line with *emphasis* here\n\nThird plain\n";

    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: fixture,
          onChange: () => {},
        },
        React.createElement(AetherMorphingDocument),
      ),
    );

    await waitFor(() => {
      assert.ok(
        document.querySelector('[data-testid="aether-morphing-document"][data-ready="true"]'),
      );
    });

    const blockB = queryBlock(1);
    const renderedB = blockB.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;
    assert.ok(renderedB.querySelector("em"));
    assert.equal(renderedB.textContent, "A line with emphasis here");
  });
});
