import { useState } from "react";

import {
  AetherEditorRoot,
  AetherMorphingDocument,
} from "@aether-md/react";

import { createGfmEditorPlugins } from "./plugins.js";

/** Slice B: inline marks (strong, emphasis, link) across multiple paragraphs. */
const INITIAL_MARKDOWN =
  "First **one** with *emphasis*\n\nSecond [link](https://example.com) here\n\nThird plain\n";

export function App() {
  const [markdown, setMarkdown] = useState(INITIAL_MARKDOWN);
  const [renderCount, setRenderCount] = useState(0);

  return (
    <main className="app">
      <h1>AetherMD Block Morphing — Slice B</h1>
      <p className="lede">
        L2 product north star demo: GFM inline marks morph between rendered
        typography (<code>&lt;strong&gt;</code>, <code>&lt;em&gt;</code>,{" "}
        <code>&lt;a&gt;</code>) and Markdown source. Click any paragraph to
        edit; only one block is in source state at a time (Block Focus from
        Slice C).
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
        Slice B scope: GFM inline mark fidelity (strong / emphasis / link).
        Slice D (list/link blocks) is follow-up. See{" "}
        <code>docs/architecture/product-experience-spec.md</code>.
      </p>
    </main>
  );
}
