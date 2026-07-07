import type {
  EngineAdapter,
  ExtensionPlugin,
  ParserAdapter,
  SerializerAdapter,
} from "@aether-md/core";

import { createGfmPreset, type GfmPreset } from "./create-gfm-preset.js";

export interface ExtensionPluginWithAdapters extends ExtensionPlugin {
  adapters?: {
    parser: ParserAdapter;
    serializer: SerializerAdapter;
    engine: EngineAdapter;
  };
  morphingRegistry?: GfmPreset["morphingRegistry"];
  registerEditorCommands?: GfmPreset["registerEditorCommands"];
}

function createBootstrapStubPlugin(): ExtensionPlugin {
  return {
    manifest: {
      metadata: {
        manifestVersion: 1,
        name: "core-bootstrap-stub",
        provides: ["core:bootstrap"],
      },
    },
  };
}

export function toExtensionPluginFromPreset(preset: GfmPreset): ExtensionPluginWithAdapters {
  return {
    manifest: preset.manifest,
    adapters: {
      parser: preset.parser,
      serializer: preset.serializer,
      engine: preset.engine,
    },
    morphingRegistry: preset.morphingRegistry,
    registerEditorCommands: preset.registerEditorCommands,
  };
}

/** Canonical GFM editor plugin wiring for tests, examples, and integration harnesses. */
export function createGfmEditorPlugins(): ExtensionPluginWithAdapters[] {
  const preset = createGfmPreset();
  return [createBootstrapStubPlugin(), toExtensionPluginFromPreset(preset)];
}
