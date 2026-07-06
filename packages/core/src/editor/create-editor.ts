import { bootstrapCore } from "../bootstrap.js";
import type { AetherDoc } from "../document-model.js";
import { CoreError } from "../errors.js";
import {
  loadPluginManifests,
  validateUniquePluginNames,
  type ExtensionPlugin,
} from "../manifest.js";
import { validateServiceCapabilities } from "../capabilities.js";
import { resolvePluginDependencyOrder } from "../dependencies.js";
import {
  resolveMorphingRegistry,
  resolveWiredAdapters,
  type ExtensionPluginWithAdapters,
} from "./adapter-wiring.js";
import { createEditorContext } from "./context.js";
import { AetherEditorImpl, createEditorRuntime } from "./aether-editor.js";
import type { EditorConfig, AetherEditor } from "./types.js";

const DEFAULT_SCHEMA = { version: 1 as const };

const EMPTY_DOC: AetherDoc = {
  type: "doc",
  children: [{ type: "paragraph", children: [{ type: "text", text: "" }] }],
};

function validateEditorPlugins(plugins: readonly ExtensionPlugin[]): void {
  if (plugins.length === 0) {
    throw new CoreError({
      code: "MANIFEST_INVALID",
      message: "EditorConfig.plugins must include at least one plugin entry",
    });
  }
}

export async function createEditor(config: EditorConfig): Promise<AetherEditor> {
  validateEditorPlugins(config.plugins);

  const loadedPlugins = loadPluginManifests(config.plugins);
  validateUniquePluginNames(loadedPlugins);
  validateServiceCapabilities(loadedPlugins);
  resolvePluginDependencyOrder(loadedPlugins);

  const wired = resolveWiredAdapters(config.plugins as ExtensionPluginWithAdapters[]);
  const morphing = resolveMorphingRegistry(config.plugins as ExtensionPluginWithAdapters[]);
  const runtime = createEditorRuntime();

  let initialDoc: AetherDoc;
  if (typeof config.initialValue === "string") {
    initialDoc = await wired.parser.parse(config.initialValue, DEFAULT_SCHEMA);
  } else if (config.initialValue !== undefined) {
    initialDoc = config.initialValue;
  } else {
    initialDoc = EMPTY_DOC;
  }

  const session = await wired.engine.create(initialDoc);

  const context = createEditorContext({
    runtime,
    engine: wired.engine,
    session,
    parser: wired.parser,
    serializer: wired.serializer,
    ...(config.security?.grantedPermissions !== undefined
      ? { grantedPermissions: config.security.grantedPermissions }
      : {}),
  });

  const bootstrapRuntime = await bootstrapCore(config.plugins, { context });

  runtime.emit({
    name: "ready",
    source: "core",
    timestamp: Date.now(),
    payload: { doc: initialDoc },
  });

  return new AetherEditorImpl({
    context,
    runtime,
    bootstrapRuntime,
    session,
    initialDoc,
    readOnly: config.readOnly ?? false,
    morphing,
  });
}
