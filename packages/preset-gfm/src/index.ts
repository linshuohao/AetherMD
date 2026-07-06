import type {
  EngineAdapter,
  ExtensionManifest,
  ParserAdapter,
  SerializerAdapter,
} from "@aether-md/core";
import { createProseMirrorEngineAdapter } from "@aether-md/plugin-prosemirror";
import {
  createRemarkParserAdapter,
  createRemarkSerializerAdapter,
} from "@aether-md/plugin-remark";

import { gfmManifest } from "./manifest.js";

export interface GfmPreset {
  manifest: ExtensionManifest;
  parser: ParserAdapter;
  serializer: SerializerAdapter;
  engine: EngineAdapter;
}

export function createGfmPreset(): GfmPreset {
  return {
    manifest: gfmManifest,
    parser: createRemarkParserAdapter(),
    serializer: createRemarkSerializerAdapter(),
    engine: createProseMirrorEngineAdapter(),
  };
}

export { gfmManifest } from "./manifest.js";
export {
  serializeInlineToMarkdown,
  serializeParagraphInlines,
} from "./gfm-inline-morphing.js";
export {
  createGfmInteractiveRenderers,
  getGfmMorphingStrategy,
  getSupportedGfmMorphingBlockTypes,
  listMorphingStrategy,
  paragraphMorphingStrategy,
} from "./morphing/registry.js";
export { paragraphSourceFromBlock } from "./morphing/paragraph-strategy.js";
export type {
  CustomBlockRenderer,
  GfmMorphingBlockStrategy,
} from "./morphing/types.js";
