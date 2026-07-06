import type { AetherError, ErrorSeverity } from "./command-event-types.js";
import type { PluginName } from "./types.js";

export type CoreErrorCode =
  | "MANIFEST_INVALID"
  | "MANIFEST_VERSION_UNSUPPORTED"
  | "CAPABILITY_MISSING"
  | "PLUGIN_NAME_DUPLICATE"
  | "PLUGIN_DEPENDENCY_MISSING"
  | "PLUGIN_DEPENDENCY_CYCLE"
  | "LIFECYCLE_HOOK_FAILED"
  | "COMMAND_UNKNOWN"
  | "RUNTIME_DISPOSED"
  | "EDITOR_ADAPTER_MISSING"
  | "EDITOR_DISPOSED";

export interface CoreErrorOptions {
  code: CoreErrorCode;
  message: string;
  cause?: unknown;
  pluginName?: PluginName;
  severity?: ErrorSeverity;
}

export class CoreError extends Error implements AetherError {
  readonly code: CoreErrorCode;
  readonly severity: ErrorSeverity;
  readonly source = "core";
  readonly cause?: unknown;
  readonly pluginName?: PluginName;

  constructor(options: CoreErrorOptions) {
    super(options.message);
    this.name = "CoreError";
    this.code = options.code;
    this.severity = options.severity ?? "fatal";
    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
    if (options.pluginName !== undefined) {
      this.pluginName = options.pluginName;
    }
  }
}

export type PluginErrorCode = "COMMAND_HANDLER_FAILED";

export interface PluginErrorOptions {
  code?: PluginErrorCode;
  message: string;
  cause?: unknown;
  pluginName?: PluginName;
}

export class PluginError extends Error implements AetherError {
  readonly code: PluginErrorCode;
  readonly severity = "recoverable";
  readonly source = "plugin";
  readonly cause?: unknown;
  readonly pluginName?: PluginName;

  constructor(options: PluginErrorOptions) {
    super(options.message);
    this.name = "PluginError";
    this.code = options.code ?? "COMMAND_HANDLER_FAILED";
    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
    if (options.pluginName !== undefined) {
      this.pluginName = options.pluginName;
    }
  }
}

export type AdapterErrorCode = "APPLY_FAILED" | "CREATE_FAILED" | "DISPOSE_FAILED" | "PARSE_FAILED";

export interface AdapterErrorOptions {
  code: AdapterErrorCode;
  message: string;
  cause?: unknown;
}

export class AdapterError extends Error implements AetherError {
  readonly code: AdapterErrorCode;
  readonly severity = "recoverable";
  readonly source = "adapter";
  readonly cause?: unknown;

  constructor(options: AdapterErrorOptions) {
    super(options.message);
    this.name = "AdapterError";
    this.code = options.code;
    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export type SerializationErrorCode = "UNSUPPORTED_NODE" | "SERIALIZE_FAILED";

export interface SerializationErrorOptions {
  code: SerializationErrorCode;
  message: string;
  cause?: unknown;
}

export class SerializationError extends Error implements AetherError {
  readonly code: SerializationErrorCode;
  readonly severity = "degraded";
  readonly source = "serialization";
  readonly cause?: unknown;

  constructor(options: SerializationErrorOptions) {
    super(options.message);
    this.name = "SerializationError";
    this.code = options.code;
    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}
