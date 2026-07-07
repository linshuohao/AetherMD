import type { InjectionKey } from "vue";

import type { UseAetherEditorResult } from "./types.js";

export const AETHER_EDITOR_CONTEXT_KEY: InjectionKey<UseAetherEditorResult> =
  Symbol("AetherEditorContext");
