import { useState } from "react";

import {
  AetherEditorRoot,
  AetherMorphingDocument,
} from "@aether-md/react";

import { createGfmEditorPlugins } from "./plugins.js";

/** Slice D: paragraphs + list block + link paragraph. */
const INITIAL_MARKDOWN =
  "Intro paragraph\n\n- alpha\n- beta\n\nVisit [docs](https://example.com) for more.\n";

export function App() {
  const [markdown, setMarkdown] = useState(INITIAL_MARKDOWN);
  const [renderCount, setRenderCount] = useState(0);

  return (
    <main className="app">
      <h1>AetherMD Block Morphing — Slice D</h1>
      <p className="lede">
        L2 product north star demo: GFM list blocks morph between rendered{" "}
        <code>ul</code>/<code>li</code> and Markdown source. Paragraph blocks
        keep inline mark fidelity (Slice B). Only one block is in source state
        at a time (Block Focus, Slice C).
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
        Slice D scope: list block morphing + preset{" "}
        <code>interactiveRenderers</code>. See{" "}
        <code>docs/architecture/product-experience-spec.md</code>.
      </p>
    </main>
  );
}
