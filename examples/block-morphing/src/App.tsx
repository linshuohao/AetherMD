import { useState } from "react";

import {
  AetherEditorRoot,
  AetherMorphingContent,
} from "@aether-md/react";

import { createGfmEditorPlugins } from "./plugins.js";

/** Slice A: single paragraph with strong emphasis. */
const INITIAL_MARKDOWN = "Hello **world**\n";

export function App() {
  const [markdown, setMarkdown] = useState(INITIAL_MARKDOWN);
  const [renderCount, setRenderCount] = useState(0);

  return (
    <main className="app">
      <h1>AetherMD Block Morphing — Slice A</h1>
      <p className="lede">
        L2 product north star demo: click the paragraph to see Markdown source
        with <code>**</code> sigils; click away to see rendered typography. No
        separate preview panel.
      </p>
      <button
        type="button"
        className="rerender-button"
        onClick={() => setRenderCount((count) => count + 1)}
      >
        Force parent rerender ({renderCount})
      </button>
      <AetherEditorRoot
        plugins={createGfmEditorPlugins()}
        value={markdown}
        onChange={setMarkdown}
      >
        <AetherMorphingContent />
      </AetherEditorRoot>
      <p className="hint">
        Slice A scope: single paragraph only. See{" "}
        <code>docs/architecture/product-experience-spec.md</code> for full north
        star.
      </p>
    </main>
  );
}
