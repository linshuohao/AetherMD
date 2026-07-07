import type {
  EngineAdapter,
  ExtensionPlugin,
  MorphingBlockStrategy,
  ParserAdapter,
  SerializerAdapter,
} from "@aether-md/core";
import { createGfmPreset } from "@aether-md/preset-gfm";

export interface ExtensionPluginWithAdapters extends ExtensionPlugin {
  adapters?: {
    parser: ParserAdapter;
    serializer: SerializerAdapter;
    engine: EngineAdapter;
  };
  morphingStrategies?: readonly MorphingBlockStrategy[];
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

function createRemarkStubPlugin(): ExtensionPlugin {
  return {
    manifest: {
      metadata: {
        manifestVersion: 1,
        name: "remark",
      },
    },
  };
}

function createProsemirrorStubPlugin(): ExtensionPlugin {
  return {
    manifest: {
      metadata: {
        manifestVersion: 1,
        name: "prosemirror",
      },
    },
  };
}

export function toExtensionPluginFromPreset(
  preset: ReturnType<typeof createGfmPreset>,
): ExtensionPluginWithAdapters {
  return {
    manifest: preset.manifest,
    adapters: {
      parser: preset.parser,
      serializer: preset.serializer,
      engine: preset.engine,
    },
    morphingStrategies: preset.morphingStrategies,
  };
}

export function createGfmEditorPlugins(): ExtensionPluginWithAdapters[] {
  const preset = createGfmPreset();
  return [
    createBootstrapStubPlugin(),
    createRemarkStubPlugin(),
    createProsemirrorStubPlugin(),
    toExtensionPluginFromPreset(preset),
  ];
}

export { SHOWCASE_MARKDOWN } from "./showcase-markdown.js";
