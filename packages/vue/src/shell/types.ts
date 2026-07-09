import { type AetherEditor, type ExtensionPlugin } from "@aether-md/core";
import { type AetherDoc } from "@aether-md/core/document";

export interface AetherEditorRootProps {
  plugins: readonly ExtensionPlugin[];
  initialValue?: string;
  value?: string;
  markdown?: string;
  onChange?: (markdown: string) => void;
  readOnly?: boolean;
}

export interface UseAetherEditorResult {
  editor: AetherEditor | null;
  markdown: string;
  doc: AetherDoc | null;
  ready: boolean;
  error: Error | null;
}
