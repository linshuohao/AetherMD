import { type AetherEditor, type ExtensionPlugin } from "@aether-md/core";
import { type AetherDoc } from "@aether-md/core/document";

import type { ReactNode } from "react";

export interface AetherEditorRootProps {
  plugins: readonly ExtensionPlugin[];
  initialValue?: string;
  value?: string;
  markdown?: string;
  onChange?: (markdown: string) => void;
  readOnly?: boolean;
  children?: ReactNode;
}

export interface UseAetherEditorResult {
  editor: AetherEditor | null;
  markdown: string;
  doc: AetherDoc | null;
  ready: boolean;
  error: Error | null;
}
