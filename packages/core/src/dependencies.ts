import { CoreError } from "./errors.js";
import type { LoadedPlugin } from "./manifest.js";
import type { PluginName } from "./types.js";

export function resolvePluginDependencyOrder(
  loadedPlugins: readonly LoadedPlugin[],
): LoadedPlugin[] {
  const pluginsByName = new Map<PluginName, LoadedPlugin>();

  // Duplicate metadata.name is rejected by validateUniquePluginNames before dependency resolution.
  for (const loadedPlugin of loadedPlugins) {
    pluginsByName.set(loadedPlugin.manifest.metadata.name, loadedPlugin);
  }

  for (const loadedPlugin of loadedPlugins) {
    for (const dependencyName of loadedPlugin.manifest.metadata.dependsOn ?? []) {
      if (!pluginsByName.has(dependencyName)) {
        throw new CoreError({
          code: "PLUGIN_DEPENDENCY_MISSING",
          message: `Plugin ${loadedPlugin.manifest.metadata.name} depends on missing plugin ${dependencyName}`,
          pluginName: loadedPlugin.manifest.metadata.name,
        });
      }
    }
  }

  const ordered: LoadedPlugin[] = [];
  const resolved = new Set<PluginName>();
  const unresolved = new Set<PluginName>(
    loadedPlugins.map((plugin) => plugin.manifest.metadata.name),
  );

  while (unresolved.size > 0) {
    const next = loadedPlugins.find((loadedPlugin) => {
      const name = loadedPlugin.manifest.metadata.name;
      if (!unresolved.has(name)) {
        return false;
      }

      const dependencies = loadedPlugin.manifest.metadata.dependsOn ?? [];
      return dependencies.every((dependencyName) => resolved.has(dependencyName));
    });

    if (next === undefined) {
      throw new CoreError({
        code: "PLUGIN_DEPENDENCY_CYCLE",
        message: "Plugin dependency graph contains a cycle",
      });
    }

    ordered.push(next);
    resolved.add(next.manifest.metadata.name);
    unresolved.delete(next.manifest.metadata.name);
  }

  return ordered;
}
