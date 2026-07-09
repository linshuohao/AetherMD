/** Plugin SDK entry — manifests, capabilities, and command/event contracts. */
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
} from "./command-event/types.js";
export type { CommandEventRuntime } from "./command-event/runtime.js";
export type { AetherSchema } from "./document/model.js";
export type { PluginErrorCode, PluginErrorOptions } from "./errors.js";
export { PluginError } from "./errors.js";
export { CORE_BUILTIN_CAPABILITIES } from "./manifest/capabilities.js";
export {
  SUPPORTED_MANIFEST_VERSIONS,
  type CompileManifest,
  type ExtensionManifest,
  type ExtensionPlugin,
  type ManifestMetadata,
  type RuntimeManifest,
  type SecurityManifest,
  type SupportedManifestVersion,
} from "./manifest/manifest.js";
export type {
  CapabilityId,
  CoreCapabilityId,
  PermissionId,
  PluginCapabilityId,
  PluginName,
  VendorCapabilityId,
} from "./types.js";
