export type {
  CapabilityId,
  CoreCapabilityId,
  PermissionId,
  PluginCapabilityId,
  PluginName,
  VendorCapabilityId,
} from "./types.js";
export { M1_CORE_CAPABILITIES } from "./capabilities.js";
export type {
  CoreErrorCode,
  CoreErrorOptions,
  PluginErrorCode,
  PluginErrorOptions,
} from "./errors.js";
export { CoreError, PluginError } from "./errors.js";
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
export type {
  AetherError,
  CommandHandler,
  CommandId,
  CommandMeta,
  CommandRequest,
  CommandResult,
  CommandSource,
  ErrorSeverity,
  EventEnvelope,
  EventListener,
  EventName,
  EventSource,
  Unsubscribe,
} from "./command-event-types.js";
export {
  createCommandEventRuntime,
  type CommandEventRuntime,
} from "./command-event-runtime.js";

