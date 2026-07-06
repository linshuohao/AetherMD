import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import React from "react";

import { AetherEditorRoot, AetherMorphingContent } from "@aether-md/react";

import { createGfmEditorPlugins } from "./plugins.js";

const FIXTURE = "Hello **world**\n";

describe("@aether-md/example-block-morphing smoke", () => {
  afterEach(() => {
    cleanup();
  });

  it("focus shows Markdown source with ** sigils", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: FIXTURE,
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
      assert.match(source.value, /\*\*world\*\*/);
    });
  });

  it("blur restores rendered strong typography", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          value: FIXTURE,
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
      assert.ok(document.querySelector('[data-testid="morphing-source"]'));
    });

    await act(async () => {
      fireEvent.blur(document.querySelector('[data-testid="morphing-source"]') as HTMLElement);
    });

    await waitFor(() => {
      const renderedAfter = document.querySelector('[data-testid="morphing-rendered"]');
      assert.ok(renderedAfter);
      assert.equal(document.querySelector('[data-testid="morphing-source"]'), null);
      assert.ok(renderedAfter.querySelector("strong"));
    });
  });
});
