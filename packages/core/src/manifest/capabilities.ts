import { CoreError } from "../errors.js";
import type { LoadedPlugin } from "./manifest.js";
import type { CapabilityId, CoreCapabilityId } from "../types.js";

export type { CapabilityId, CoreCapabilityId } from "../types.js";

/** Core capabilities provided by bootstrap without adapter plugins. */
export const CORE_BUILTIN_CAPABILITIES = [
  "core:history",
  "core:selection",
  "core:clipboard",
  "core:assets",
] as const satisfies readonly CoreCapabilityId[];

export interface CapabilityValidationResult {
  provided: ReadonlySet<CapabilityId>;
}

export function validateServiceCapabilities(
  loadedPlugins: readonly LoadedPlugin[],
): CapabilityValidationResult {
  const provided = collectProvidedCapabilities(loadedPlugins);

  for (const loadedPlugin of loadedPlugins) {
    const requires = loadedPlugin.manifest.metadata.requires ?? [];
    for (const capability of requires) {
      if (!provided.has(capability)) {
        throw new CoreError({
          code: "CAPABILITY_MISSING",
          message: `Required capability ${capability} is not provided`,
          pluginName: loadedPlugin.manifest.metadata.name,
        });
      }
    }
  }

  return { provided };
}

export function collectProvidedCapabilities(
  loadedPlugins: readonly LoadedPlugin[],
): ReadonlySet<CapabilityId> {
  const provided = new Set<CapabilityId>(CORE_BUILTIN_CAPABILITIES);

  for (const loadedPlugin of loadedPlugins) {
    for (const capability of loadedPlugin.manifest.metadata.provides ?? []) {
      provided.add(capability);
    }

    const adapters = (loadedPlugin.plugin as { adapters?: { parser?: unknown; engine?: unknown } })
      .adapters;
    if (adapters?.parser) {
      provided.add("core:parser");
    }
    if (adapters?.engine) {
      provided.add("core:engine");
    }
  }

  return provided;
}
