import type {
  EngineAdapter,
  ExtensionPlugin,
  ParserAdapter,
  SerializerAdapter,
} from "@aether-md/core";
import { createGfmPreset } from "@aether-md/preset-gfm";

interface ExtensionPluginWithAdapters extends ExtensionPlugin {
  adapters?: {
    parser: ParserAdapter;
    serializer: SerializerAdapter;
    engine: EngineAdapter;
  };
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

export function createGfmEditorPlugins(): ExtensionPluginWithAdapters[] {
  const preset = createGfmPreset();
  return [
    createBootstrapStubPlugin(),
    createRemarkStubPlugin(),
    createProsemirrorStubPlugin(),
    {
      manifest: preset.manifest,
      adapters: {
        parser: preset.parser,
        serializer: preset.serializer,
        engine: preset.engine,
      },
    },
  ];
}
