import type { EngineAdapter, ParserAdapter, SerializerAdapter } from "../document/adapter-types.js";
import type { AetherSchema } from "../document/model.js";
import type { CommandEventRuntime } from "../command-event/runtime.js";
import { CoreError } from "../errors.js";
import type { ExtensionManifest, ExtensionPlugin } from "../manifest/manifest.js";
import type { MorphingStrategyAccessor } from "./types.js";

export interface PluginAdapters {
  parser: ParserAdapter;
  serializer: SerializerAdapter;
  engine: EngineAdapter;
}

export interface EditorCommandRegistrationOptions {
  parser: ParserAdapter;
  schema: AetherSchema;
}

export interface ExtensionPluginWithAdapters extends ExtensionPlugin {
  adapters?: PluginAdapters;
  morphingRegistry?: MorphingStrategyAccessor;
  registerEditorCommands?: (
    runtime: CommandEventRuntime,
    options: EditorCommandRegistrationOptions,
  ) => void;
}

export interface PresetBundle {
  manifest: ExtensionManifest;
  parser: ParserAdapter;
  serializer: SerializerAdapter;
  engine: EngineAdapter;
  morphingRegistry?: MorphingStrategyAccessor;
  registerEditorCommands?: (
    runtime: CommandEventRuntime,
    options: EditorCommandRegistrationOptions,
  ) => void;
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
    ...(preset.morphingRegistry !== undefined ? { morphingRegistry: preset.morphingRegistry } : {}),
    ...(preset.registerEditorCommands !== undefined
      ? { registerEditorCommands: preset.registerEditorCommands }
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

const EMPTY_MORPHING_ACCESSOR: MorphingStrategyAccessor = {
  get() {
    return undefined;
  },
  list() {
    return [];
  },
};

export function resolveMorphingAccessor(
  plugins: readonly ExtensionPluginWithAdapters[],
): MorphingStrategyAccessor {
  let accessor: MorphingStrategyAccessor | undefined;
  for (const plugin of plugins) {
    if (plugin.morphingRegistry) {
      accessor = plugin.morphingRegistry;
    }
  }
  return accessor ?? EMPTY_MORPHING_ACCESSOR;
}
