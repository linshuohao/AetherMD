import { CoreError } from "./errors.js";
import type { LoadedPlugin } from "./manifest.js";

export interface LifecycleStartupResult {
  successfulLifecycleOrder: LoadedPlugin[];
}

export async function runStartupLifecycle(
  orderedPlugins: readonly LoadedPlugin[],
  context: unknown,
): Promise<LifecycleStartupResult> {
  const initialized: LoadedPlugin[] = [];

  for (const loadedPlugin of orderedPlugins) {
    await runHook(loadedPlugin, "onInit", context);
    initialized.push(loadedPlugin);
  }

  for (const loadedPlugin of orderedPlugins) {
    await runHook(loadedPlugin, "onReady", context);
  }

  return {
    successfulLifecycleOrder: initialized,
  };
}

export async function runDestroyLifecycle(
  successfulLifecycleOrder: readonly LoadedPlugin[],
  context: unknown,
): Promise<void> {
  for (const loadedPlugin of [...successfulLifecycleOrder].reverse()) {
    await runHook(loadedPlugin, "onDestroy", context);
  }
}

async function runHook(
  loadedPlugin: LoadedPlugin,
  hookName: "onInit" | "onReady" | "onDestroy",
  context: unknown,
): Promise<void> {
  const hook = loadedPlugin.manifest.runtime?.[hookName];
  if (hook === undefined) {
    return;
  }

  try {
    await hook(context);
  } catch (cause) {
    throw new CoreError({
      code: "LIFECYCLE_HOOK_FAILED",
      message: `Plugin ${loadedPlugin.manifest.metadata.name} ${hookName} failed`,
      cause,
      pluginName: loadedPlugin.manifest.metadata.name,
    });
  }
}
