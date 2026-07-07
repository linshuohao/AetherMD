export type { GfmPreset, GfmPresetEditorCommandRegistrar } from "./create-gfm-preset.js";
export { createGfmPreset } from "./create-gfm-preset.js";
export { gfmManifest } from "./manifest.js";
export { serializeInlineToMarkdown, serializeParagraphInlines } from "./gfm-inline-morphing.js";
export {
  createGfmInteractiveRenderers,
  createGfmMorphingRegistry,
  getSupportedGfmMorphingBlockTypes,
  listMorphingStrategy,
  paragraphMorphingStrategy,
} from "./morphing/registry.js";
export type {
  CustomBlockRenderer,
  MorphingBlockStrategy,
  MorphingStrategyRegistry,
  ParseBlockMarkdownPayload,
} from "@aether-md/morphing-contracts";
export {
  PARSE_BLOCK_MARKDOWN_COMMAND,
  createMorphingStrategyRegistry,
} from "@aether-md/morphing-contracts";
export { registerGfmEditorCommands, type GfmEditorCommandDeps } from "./editor-commands.js";
export {
  createGfmEditorPlugins,
  toExtensionPluginFromPreset,
  type ExtensionPluginWithAdapters,
} from "./create-gfm-editor-plugins.js";
