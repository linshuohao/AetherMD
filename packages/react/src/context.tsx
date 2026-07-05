import { createContext } from "react";

import type { UseAetherEditorResult } from "./types.js";

export const AetherEditorContext = createContext<UseAetherEditorResult | null>(null);

export type AetherEditorContextValue = UseAetherEditorResult;
