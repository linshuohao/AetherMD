export type { AetherEditorRootProps, UseAetherEditorResult } from "./shell/types.js";
export { AetherEditorRoot } from "./shell/aether-editor-root.js";
export { AetherMorphingDocument } from "./morphing/aether-morphing-document.js";
export { AetherMorphingContent } from "./morphing/aether-morphing-content.js";
export {
  AetherEditorContent,
  AetherEditorContent as AetherLegacyEditorContent,
} from "./shell/aether-editor-content.js";
export { useAetherEditor } from "./shell/use-aether-editor.js";
export { shouldApplyControlledValue } from "./shell/gate-lock.js";
