import { validateServiceCapabilities } from "../manifest/capabilities.js";
import { resolvePluginDependencyOrder } from "../manifest/dependencies.js";
import { runDestroyLifecycle, runStartupLifecycle } from "./lifecycle.js";
import {
  type ExtensionPlugin,
  type LoadedPlugin,
  loadPluginManifests,
  validateUniquePluginNames,
} from "../manifest/manifest.js";

export interface BootstrapCoreOptions {
  context?: unknown;
  preparedOrderedPlugins?: readonly LoadedPlugin[];
}

export interface CoreBootstrapRuntime {
  readonly context: unknown;
  readonly orderedPlugins: readonly LoadedPlugin[];
  readonly successfulLifecycleOrder: readonly LoadedPlugin[];
  dispose(): Promise<void>;
}

export async function bootstrapCore(
  plugins: readonly ExtensionPlugin[],
  options: BootstrapCoreOptions = {},
): Promise<CoreBootstrapRuntime> {
  const context = options.context ?? {};
  const orderedPlugins =
    options.preparedOrderedPlugins ??
    (() => {
      const loadedPlugins = loadPluginManifests(plugins);
      validateUniquePluginNames(loadedPlugins);
      validateServiceCapabilities(loadedPlugins);
      return resolvePluginDependencyOrder(loadedPlugins);
    })();
  const lifecycle = await runStartupLifecycle(orderedPlugins, context);
  let disposed = false;

  return {
    context,
    orderedPlugins,
    successfulLifecycleOrder: lifecycle.successfulLifecycleOrder,
    async dispose() {
      if (disposed) {
        return;
      }

      disposed = true;
      await runDestroyLifecycle(lifecycle.successfulLifecycleOrder, context);
    },
  };
}
