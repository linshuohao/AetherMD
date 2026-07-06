import { CoreError } from "../errors.js";
import type { LoadedPlugin } from "../manifest/manifest.js";

export interface LifecycleStartupResult {
  successfulLifecycleOrder: LoadedPlugin[];
}

export interface RunDestroyLifecycleOptions {
  continueOnDestroyFailure?: boolean;
}

export async function runStartupLifecycle(
  orderedPlugins: readonly LoadedPlugin[],
  context: unknown,
): Promise<LifecycleStartupResult> {
  const initialized: LoadedPlugin[] = [];

  try {
    for (const loadedPlugin of orderedPlugins) {
      await runHook(loadedPlugin, "onInit", context);
      initialized.push(loadedPlugin);
    }

    for (const loadedPlugin of orderedPlugins) {
      await runHook(loadedPlugin, "onReady", context);
    }
  } catch (startupError) {
    await runStartupFailureCleanup(initialized, context);
    throw startupError;
  }

  return {
    successfulLifecycleOrder: initialized,
  };
}

export async function runDestroyLifecycle(
  successfulLifecycleOrder: readonly LoadedPlugin[],
  context: unknown,
  options: RunDestroyLifecycleOptions = {},
): Promise<void> {
  for (const loadedPlugin of [...successfulLifecycleOrder].reverse()) {
    if (options.continueOnDestroyFailure) {
      try {
        await runHook(loadedPlugin, "onDestroy", context);
      } catch {
        // Best-effort cleanup during startup failure; primary error is rethrown by caller.
      }
      continue;
    }

    await runHook(loadedPlugin, "onDestroy", context);
  }
}

async function runStartupFailureCleanup(
  successfulOnInitOrder: readonly LoadedPlugin[],
  context: unknown,
): Promise<void> {
  if (successfulOnInitOrder.length === 0) {
    return;
  }

  await runDestroyLifecycle(successfulOnInitOrder, context, {
    continueOnDestroyFailure: true,
  });
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
