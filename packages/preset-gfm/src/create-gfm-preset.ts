import type {
  AetherSchema,
  CommandEventRuntime,
  EngineAdapter,
  ExtensionManifest,
  ParserAdapter,
  SerializerAdapter,
} from "@aether-md/core";
import { createProseMirrorEngineAdapter } from "@aether-md/plugin-prosemirror";
import { createRemarkParserAdapter, createRemarkSerializerAdapter } from "@aether-md/plugin-remark";
import type {
  MorphingBlockStrategy,
  MorphingStrategyRegistry,
} from "@aether-md/morphing-contracts";

import { registerGfmEditorCommands } from "./editor-commands.js";
import { gfmManifest } from "./manifest.js";
import {
  createGfmMorphingRegistry,
  listMorphingStrategy,
  paragraphMorphingStrategy,
} from "./morphing/registry.js";

export interface GfmPresetEditorCommandRegistrar {
  registerEditorCommands(
    runtime: CommandEventRuntime,
    options: { parser: ParserAdapter; schema: AetherSchema },
  ): void;
}

export interface GfmPreset extends GfmPresetEditorCommandRegistrar {
  manifest: ExtensionManifest;
  parser: ParserAdapter;
  serializer: SerializerAdapter;
  engine: EngineAdapter;
  morphingStrategies: readonly MorphingBlockStrategy[];
  morphingRegistry: MorphingStrategyRegistry;
}

export function createGfmPreset(): GfmPreset {
  const parser = createRemarkParserAdapter();
  const serializer = createRemarkSerializerAdapter();
  const engine = createProseMirrorEngineAdapter();

  return {
    manifest: gfmManifest,
    parser,
    serializer,
    engine,
    morphingStrategies: [paragraphMorphingStrategy, listMorphingStrategy],
    morphingRegistry: createGfmMorphingRegistry(),
    registerEditorCommands(runtime, options) {
      registerGfmEditorCommands(runtime, {
        parser: options.parser,
        schema: options.schema,
      });
    },
  };
}
