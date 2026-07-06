import { useState } from "react";

import { AetherEditorContent, AetherEditorRoot, useAetherEditor } from "@aether-md/react";

import { createGfmEditorPlugins } from "./plugins.js";

const INITIAL_MARKDOWN = `# AetherMD Demo

Hello **bold** text.

- list item

Learn more at [AetherMD](https://github.com/linshuohao/AetherMD).
`;

function MarkdownPreview() {
  const { markdown, ready } = useAetherEditor();
  return (
    <section>
      <h2>Markdown preview</h2>
      <pre data-testid="markdown-preview">{ready ? markdown : "Loading…"}</pre>
    </section>
  );
}

export function App() {
  const [markdown, setMarkdown] = useState(INITIAL_MARKDOWN);
  const [renderCount, setRenderCount] = useState(0);

  return (
    <main>
      <h1>AetherMD React Basic Example</h1>
      <p>
        GateLock demo: edit below, then force a parent rerender without changing <code>value</code>.
        The document should not reset.
      </p>
      <button type="button" onClick={() => setRenderCount((count) => count + 1)}>
        Force parent rerender ({renderCount})
      </button>
      <AetherEditorRoot plugins={createGfmEditorPlugins()} value={markdown} onChange={setMarkdown}>
        <AetherEditorContent />
        <MarkdownPreview />
      </AetherEditorRoot>
    </main>
  );
}
