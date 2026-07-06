import type { EngineAdapter, ParserAdapter, SerializerAdapter } from "../adapter-types.js";
import { CoreError } from "../errors.js";
import type { ExtensionManifest, ExtensionPlugin } from "../manifest.js";

export interface PluginAdapters {
  parser: ParserAdapter;
  serializer: SerializerAdapter;
  engine: EngineAdapter;
}

export interface ExtensionPluginWithAdapters extends ExtensionPlugin {
  adapters?: PluginAdapters;
}

export interface PresetBundle {
  manifest: ExtensionManifest;
  parser: ParserAdapter;
  serializer: SerializerAdapter;
  engine: EngineAdapter;
}

export interface WiredAdapters {
  parser: ParserAdapter;
  serializer: SerializerAdapter;
  engine: EngineAdapter;
}

export function toExtensionPluginFromPreset(preset: PresetBundle): ExtensionPluginWithAdapters {
  return {
    manifest: preset.manifest,
    adapters: {
      parser: preset.parser,
      serializer: preset.serializer,
      engine: preset.engine,
    },
  };
}

export function resolveWiredAdapters(
  plugins: readonly ExtensionPluginWithAdapters[],
): WiredAdapters {
  let parser: ParserAdapter | undefined;
  let serializer: SerializerAdapter | undefined;
  let engine: EngineAdapter | undefined;

  for (const plugin of plugins) {
    const adapters = plugin.adapters;
    if (!adapters) {
      continue;
    }
    if (adapters.parser) {
      parser = adapters.parser;
    }
    if (adapters.serializer) {
      serializer = adapters.serializer;
    }
    if (adapters.engine) {
      engine = adapters.engine;
    }
  }

  if (!parser || !serializer || !engine) {
    throw new CoreError({
      code: "EDITOR_ADAPTER_MISSING",
      message: "Editor orchestration requires wired parser, serializer, and engine adapters",
    });
  }

  return { parser, serializer, engine };
}
