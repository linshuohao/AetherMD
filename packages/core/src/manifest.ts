import type { CapabilityId, PermissionId, PluginName } from "./types.js";
import { CoreError } from "./errors.js";

export const SUPPORTED_MANIFEST_VERSIONS = [1] as const;

export type SupportedManifestVersion = (typeof SUPPORTED_MANIFEST_VERSIONS)[number];

export interface ManifestMetadata {
  manifestVersion: SupportedManifestVersion;
  name: PluginName;
  version?: string;
  provides?: CapabilityId[];
  requires?: CapabilityId[];
  dependsOn?: PluginName[];
}

export type CompileManifest = Record<string, unknown>;

export interface RuntimeManifest {
  onInit?(ctx: unknown): void | Promise<void>;
  onReady?(ctx: unknown): void | Promise<void>;
  onDestroy?(ctx: unknown): void | Promise<void>;
}

export interface SecurityManifest {
  requests?: PermissionId[];
}

export interface ExtensionManifest {
  metadata: ManifestMetadata;
  compile?: CompileManifest;
  runtime?: RuntimeManifest;
  security?: SecurityManifest;
}

export interface ExtensionPlugin {
  manifest: ExtensionManifest;
}

export interface LoadedPlugin {
  plugin: ExtensionPlugin;
  manifest: ExtensionManifest;
}

export function loadPluginManifests(plugins: readonly unknown[]): LoadedPlugin[] {
  return plugins.map((plugin, index) => {
    const manifest = readManifest(plugin, index);
    validateSupportedManifestVersion(manifest.metadata.manifestVersion, {
      pluginName: manifest.metadata.name,
    });

    return {
      plugin: plugin as ExtensionPlugin,
      manifest,
    };
  });
}

export function validateUniquePluginNames(loadedPlugins: readonly LoadedPlugin[]): void {
  const seen = new Map<PluginName, number>();

  for (const loadedPlugin of loadedPlugins) {
    const name = loadedPlugin.manifest.metadata.name;
    seen.set(name, (seen.get(name) ?? 0) + 1);
  }

  for (const [name, count] of seen) {
    if (count > 1) {
      throw new CoreError({
        code: "PLUGIN_NAME_DUPLICATE",
        message: `Duplicate plugin metadata.name: ${name}`,
        pluginName: name,
      });
    }
  }
}

export function validateSupportedManifestVersion(
  version: unknown,
  options: { pluginName?: PluginName } = {},
): asserts version is SupportedManifestVersion {
  if (
    typeof version !== "number" ||
    !SUPPORTED_MANIFEST_VERSIONS.includes(version as SupportedManifestVersion)
  ) {
    const pluginName = options.pluginName;
    throw new CoreError({
      code: "MANIFEST_VERSION_UNSUPPORTED",
      message: `manifestVersion ${String(version)} is not supported`,
      ...(pluginName === undefined ? {} : { pluginName }),
    });
  }
}

function readManifest(plugin: unknown, index: number): ExtensionManifest {
  if (!isRecord(plugin) || !isRecord(plugin.manifest)) {
    throw invalidManifest("plugin entry must include manifest object", index);
  }

  const manifest = plugin.manifest;
  if (!isRecord(manifest.metadata)) {
    throw invalidManifest("manifest.metadata must be an object", index);
  }

  const metadata = manifest.metadata;
  if (typeof metadata.name !== "string" || metadata.name.length === 0) {
    throw invalidManifest("manifest.metadata.name must be a non-empty string", index);
  }

  if (!isOptionalString(metadata.version)) {
    throw invalidManifest("manifest.metadata.version must be a string", index);
  }

  if (!isOptionalStringArray(metadata.provides)) {
    throw invalidManifest("manifest.metadata.provides must be a string array", index);
  }

  if (!isOptionalStringArray(metadata.requires)) {
    throw invalidManifest("manifest.metadata.requires must be a string array", index);
  }

  if (!isOptionalStringArray(metadata.dependsOn)) {
    throw invalidManifest("manifest.metadata.dependsOn must be a string array", index);
  }

  if (!isOptionalRecord(manifest.compile)) {
    throw invalidManifest("manifest.compile must be an object", index);
  }

  if (!isOptionalRecord(manifest.runtime)) {
    throw invalidManifest("manifest.runtime must be an object", index);
  }

  if (!isOptionalRecord(manifest.security)) {
    throw invalidManifest("manifest.security must be an object", index);
  }

  if (isRecord(manifest.security) && !isOptionalStringArray(manifest.security.requests)) {
    throw invalidManifest("manifest.security.requests must be a string array", index);
  }

  return manifest as unknown as ExtensionManifest;
}

function invalidManifest(message: string, index: number): CoreError {
  return new CoreError({
    code: "MANIFEST_INVALID",
    message: `Invalid plugin manifest at index ${index}: ${message}`,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionalRecord(value: unknown): boolean {
  return value === undefined || isRecord(value);
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === "string";
}

function isOptionalStringArray(value: unknown): boolean {
  return value === undefined || (Array.isArray(value) && value.every(isString));
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}
