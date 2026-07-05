import "./test-setup.js";

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { cleanup, render, waitFor } from "@testing-library/react";
import React from "react";

import {
  AetherEditorContent,
  AetherEditorRoot,
  useAetherEditor,
} from "./index.js";
import { createGfmEditorPlugins } from "./test-helpers.js";

function MarkdownProbe() {
  const { markdown, ready } = useAetherEditor();
  if (!ready) {
    return null;
  }
  return React.createElement("div", { "data-testid": "markdown-probe" }, markdown);
}

describe("GFM React smoke", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders paragraph fixture through React Shell", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          initialValue: "Hello world\n",
        },
        React.createElement(AetherEditorContent),
        React.createElement(MarkdownProbe),
      ),
    );

    await waitFor(() => {
      const probe = document.querySelector('[data-testid="markdown-probe"]');
      assert.ok(probe);
      assert.match(probe?.textContent ?? "", /Hello world/);
    });
  });

  it("renders strong inline fixture through React Shell", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          initialValue: "**bold**\n",
        },
        React.createElement(AetherEditorContent),
        React.createElement(MarkdownProbe),
      ),
    );

    await waitFor(() => {
      const probe = document.querySelector('[data-testid="markdown-probe"]');
      assert.ok(probe);
      assert.match(probe?.textContent ?? "", /bold/);
    });
  });

  it("renders list fixture through React Shell", async () => {
    render(
      React.createElement(
        AetherEditorRoot,
        {
          plugins: createGfmEditorPlugins(),
          initialValue: "- item one\n- item two\n",
        },
        React.createElement(AetherEditorContent),
        React.createElement(MarkdownProbe),
      ),
    );

    await waitFor(() => {
      const probe = document.querySelector('[data-testid="markdown-probe"]');
      assert.ok(probe);
      assert.match(probe?.textContent ?? "", /item one/);
      assert.match(probe?.textContent ?? "", /item two/);
    });
  });
});
