import { bootstrapCore } from "../bootstrap/bootstrap.js";
import { ensureDocumentBlockIds } from "../document/block-ids.js";
import type { AetherDoc } from "../document/model.js";
import { CoreError } from "../errors.js";
import {
  loadPluginManifests,
  validateUniquePluginNames,
  type ExtensionPlugin,
} from "../manifest/manifest.js";
import { validateServiceCapabilities } from "../manifest/capabilities.js";
import { resolvePluginDependencyOrder } from "../manifest/dependencies.js";
import { mergeManifestLayers } from "../manifest/merge.js";
import { resolveEffectivePermissions } from "../manifest/permissions.js";
import {
  resolveMorphingAccessor,
  resolveWiredAdapters,
  type ExtensionPluginWithAdapters,
} from "./adapter-wiring.js";
import { createEditorContext } from "./context.js";
import {
  AetherEditorImpl,
  createBuiltinServicesForEditor,
  createEditorRuntime,
} from "./aether-editor.js";
import { createDefaultConflictResolver } from "./conflict-resolver.js";
import { applyWorkerRuntime } from "./worker-runtime.js";

import type { EditorConfig, AetherEditor } from "./types.js";

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

function registerPluginEditorCommands(
  plugins: readonly ExtensionPluginWithAdapters[],
  runtime: ReturnType<typeof createEditorRuntime>,
  options: {
    parser: ReturnType<typeof resolveWiredAdapters>["parser"];
    schema: NonNullable<ReturnType<typeof mergeManifestLayers>["compile"]>["schema"];
  },
): void {
  for (const plugin of plugins) {
    plugin.registerEditorCommands?.(runtime, {
      parser: options.parser,
      schema: options.schema,
    });
  }
}

export async function createEditor(config: EditorConfig): Promise<AetherEditor> {
  validateEditorPlugins(config.plugins);

  const loadedPlugins = loadPluginManifests(config.plugins);
  validateUniquePluginNames(loadedPlugins);
  const conflictResolver = config.conflictResolver ?? createDefaultConflictResolver();
  const mergedManifest = mergeManifestLayers(loadedPlugins, conflictResolver);
  const capabilityResult = validateServiceCapabilities(loadedPlugins);
  const orderedPlugins = resolvePluginDependencyOrder(loadedPlugins);

  const grantedPermissions = resolveEffectivePermissions({
    loadedPlugins,
    ...(config.security?.grantedPermissions !== undefined
      ? { hostGranted: config.security.grantedPermissions }
      : {}),
    ...(config.security?.defaultDeny !== undefined
      ? { defaultDeny: config.security.defaultDeny }
      : {}),
  });
  const { wired, handle: workerHandle } = await applyWorkerRuntime(
    resolveWiredAdapters(config.plugins as ExtensionPluginWithAdapters[]),
    config.workers,
    grantedPermissions,
  );
  const morphing = resolveMorphingAccessor(config.plugins as ExtensionPluginWithAdapters[]);
  const editorSchema = mergedManifest.compile.schema;
  const runtime = createEditorRuntime({
    pipeline: {
      readOnly: config.readOnly ?? false,
      providedCapabilities: capabilityResult.provided,
      grantedPermissions,
    },
    conflictResolver,
  });

  let initialDoc: AetherDoc;
  if (typeof config.initialValue === "string") {
    initialDoc = await wired.parser.parse(config.initialValue, editorSchema);
  } else if (config.initialValue !== undefined) {
    initialDoc = config.initialValue;
  } else {
    initialDoc = EMPTY_DOC;
  }

  initialDoc = ensureDocumentBlockIds(initialDoc);

  const session = await wired.engine.create(initialDoc);

  const builtin = createBuiltinServicesForEditor(wired.engine, session, grantedPermissions);

  const context = createEditorContext({
    runtime,
    engine: wired.engine,
    session,
    parser: wired.parser,
    serializer: wired.serializer,
    builtin,
    grantedPermissions,
    ...(config.telemetry !== undefined ? { telemetry: config.telemetry } : {}),
  });

  registerPluginEditorCommands(config.plugins as ExtensionPluginWithAdapters[], runtime, {
    parser: wired.parser,
    schema: editorSchema,
  });

  const bootstrapRuntime = await bootstrapCore(config.plugins, {
    context,
    preparedOrderedPlugins: orderedPlugins,
  });

  const readyTimestamp = Date.now();
  context.telemetry.track({
    name: "editor.ready",
    timestamp: readyTimestamp,
    attributes: { pluginCount: config.plugins.length },
  });
  context.telemetry.startSpan("editor.lifecycle", { phase: "ready" }).end(readyTimestamp);

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
    schema: editorSchema,
    workerHandle,
  });
}
