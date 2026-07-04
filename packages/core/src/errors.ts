import type { AetherError, ErrorSeverity } from "./command-event-types.js";
import type { PluginName } from "./types.js";

export type CoreErrorCode =
  | "MANIFEST_INVALID"
  | "MANIFEST_VERSION_UNSUPPORTED"
  | "CAPABILITY_MISSING"
  | "PLUGIN_DEPENDENCY_MISSING"
  | "PLUGIN_DEPENDENCY_CYCLE"
  | "LIFECYCLE_HOOK_FAILED"
  | "COMMAND_UNKNOWN"
  | "RUNTIME_DISPOSED";

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
