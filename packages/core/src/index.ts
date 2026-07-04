export type {
  CapabilityId,
  CoreCapabilityId,
  PermissionId,
  PluginCapabilityId,
  PluginName,
  VendorCapabilityId,
} from "./types.js";
export { M1_CORE_CAPABILITIES } from "./capabilities.js";
export type { CoreErrorCode, CoreErrorOptions } from "./errors.js";
export { CoreError } from "./errors.js";
export {
  bootstrapCore,
  type BootstrapCoreOptions,
  type CoreBootstrapRuntime,
} from "./bootstrap.js";
export { resolvePluginDependencyOrder } from "./dependencies.js";
export {
  SUPPORTED_MANIFEST_VERSIONS,
  type CompileManifest,
  type ExtensionManifest,
  type ExtensionPlugin,
  type ManifestMetadata,
  type RuntimeManifest,
  type SecurityManifest,
  type SupportedManifestVersion,
} from "./manifest.js";
