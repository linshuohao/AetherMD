import { useState } from "react";

import { createGfmEditorPlugins } from "@aether-md/example-shared";
import {
  E2EProbes,
  MoveListBlockButton,
  ParentRerenderButton,
} from "@aether-md/example-shared/e2e-probes";
import { SHOWCASE_MARKDOWN } from "@aether-md/example-shared/showcase-markdown";
import { AetherEditorContent, AetherEditorRoot, AetherMorphingDocument } from "@aether-md/react";

export type ReactShellMode = "content" | "morphing";

const SHELLS: { mode: ReactShellMode; label: string }[] = [
  { mode: "morphing", label: "AetherMorphingDocument" },
  { mode: "content", label: "AetherEditorContent (legacy)" },
];

export function AetherShellShowcase() {
  const [mode, setMode] = useState<ReactShellMode>("morphing");
  const [markdown, setMarkdown] = useState(SHOWCASE_MARKDOWN);
  const [renderCount, setRenderCount] = useState(0);

  return (
    <main className="example" data-testid="aether-shell-showcase">
      <nav className="shell-switcher" aria-label="React shell">
        {SHELLS.map(({ mode: shellMode, label }) => (
          <button
            key={shellMode}
            type="button"
            className="shell-switcher-button"
            data-testid={`shell-mode-${shellMode}`}
            aria-pressed={mode === shellMode}
            onClick={() => setMode(shellMode)}
          >
            {label}
          </button>
        ))}
      </nav>

      <AetherEditorRoot plugins={createGfmEditorPlugins()} value={markdown} onChange={setMarkdown}>
        {mode === "content" ? (
          <section className="example-editor" data-testid="aether-react-basic-shell">
            <AetherEditorContent />
          </section>
        ) : (
          <section className="example-editor" data-testid="aether-morphing-shell">
            <AetherMorphingDocument />
          </section>
        )}
        <div className="e2e-toolbar">
          <ParentRerenderButton
            renderCount={renderCount}
            onRerender={() => setRenderCount((count) => count + 1)}
          />
          {mode === "morphing" ? <MoveListBlockButton /> : null}
        </div>
        <E2EProbes markdown={markdown} enableMoveBlock={mode === "morphing"} />
      </AetherEditorRoot>
    </main>
  );
}
