import { useState } from "react";

import {
  E2EProbes,
  MoveListBlockButton,
  ParentRerenderButton,
} from "@aether-md/example-shared/e2e-probes";
import { SHOWCASE_MARKDOWN } from "@aether-md/example-shared/showcase-markdown";
import { AetherEditorRoot, AetherMorphingDocument } from "@aether-md/react";

import { createGfmEditorPlugins } from "./plugins.js";

export function App() {
  const [markdown, setMarkdown] = useState(SHOWCASE_MARKDOWN);
  const [renderCount, setRenderCount] = useState(0);

  return (
    <main className="example">
      <header className="example-header">
        <h1>Shell: AetherMorphingDocument</h1>
        <p>Instant Morphing 多块壳 · 预设 GFM 全插件 · 可编辑语法展示文稿</p>
      </header>
      <AetherEditorRoot plugins={createGfmEditorPlugins()} value={markdown} onChange={setMarkdown}>
        <section className="example-editor">
          <AetherMorphingDocument />
        </section>
        <div className="e2e-toolbar">
          <ParentRerenderButton
            renderCount={renderCount}
            onRerender={() => setRenderCount((count) => count + 1)}
          />
          <MoveListBlockButton />
        </div>
        <E2EProbes markdown={markdown} enableMoveBlock />
      </AetherEditorRoot>
    </main>
  );
}
