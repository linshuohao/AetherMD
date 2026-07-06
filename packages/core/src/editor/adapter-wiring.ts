import type { EngineAdapter, ParserAdapter, SerializerAdapter } from "../adapter-types.js";
import type { MorphingBlockStrategy } from "../morphing-types.js";
import { createMorphingStrategyRegistry } from "../morphing-types.js";
import { CoreError } from "../errors.js";
import type { ExtensionManifest, ExtensionPlugin } from "../manifest.js";

export interface PluginAdapters {
  parser: ParserAdapter;
  serializer: SerializerAdapter;
  engine: EngineAdapter;
}

export interface ExtensionPluginWithAdapters extends ExtensionPlugin {
  adapters?: PluginAdapters;
  morphingStrategies?: readonly MorphingBlockStrategy[];
}

export interface PresetBundle {
  manifest: ExtensionManifest;
  parser: ParserAdapter;
  serializer: SerializerAdapter;
  engine: EngineAdapter;
  morphingStrategies?: readonly MorphingBlockStrategy[];
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
    ...(preset.morphingStrategies !== undefined
      ? { morphingStrategies: preset.morphingStrategies }
      : {}),
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

export function resolveMorphingRegistry(plugins: readonly ExtensionPluginWithAdapters[]) {
  const strategies: MorphingBlockStrategy[] = [];
  for (const plugin of plugins) {
    if (plugin.morphingStrategies) {
      strategies.push(...plugin.morphingStrategies);
    }
  }
  return createMorphingStrategyRegistry(strategies);
}
