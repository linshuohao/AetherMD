import { useState } from "react";

import {
  AetherEditorRoot,
  AetherMorphingDocument,
} from "@aether-md/react";

import { createGfmEditorPlugins } from "./plugins.js";

/** Slice C: three paragraphs for multi-block Block Focus. */
const INITIAL_MARKDOWN =
  "First **one**\n\nSecond **two**\n\nThird plain\n";

export function App() {
  const [markdown, setMarkdown] = useState(INITIAL_MARKDOWN);
  const [renderCount, setRenderCount] = useState(0);

  return (
    <main className="app">
      <h1>AetherMD Block Morphing — Slice C</h1>
      <p className="lede">
        L2 product north star demo: click any paragraph to edit its Markdown
        source with <code>**</code> sigils; click another paragraph to switch
        Block Focus. Only one block is in source state at a time.
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
        <AetherMorphingDocument />
      </AetherEditorRoot>
      <p className="hint">
        Slice C scope: paragraph blocks only. See{" "}
        <code>docs/architecture/product-experience-spec.md</code> for full north
        star.
      </p>
    </main>
  );
}
