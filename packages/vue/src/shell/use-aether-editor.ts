import { inject } from "vue";

import { AETHER_EDITOR_CONTEXT_KEY } from "./context.js";
import type { UseAetherEditorResult } from "./types.js";

export function useAetherEditor(): UseAetherEditorResult {
  const context = inject(AETHER_EDITOR_CONTEXT_KEY);

  if (context === undefined) {
    throw new Error("useAetherEditor must be used within AetherEditorRoot");
  }

  return {
    get editor() {
      return context.editor;
    },
    get markdown() {
      return context.markdown;
    },
    get doc() {
      return context.doc;
    },
    get ready() {
      return context.ready;
    },
    get error() {
      return context.error;
    },
  };
}
