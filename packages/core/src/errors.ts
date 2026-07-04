import type { PluginName } from "./types.js";

export type CoreErrorCode =
  | "MANIFEST_INVALID"
  | "MANIFEST_VERSION_UNSUPPORTED"
  | "CAPABILITY_MISSING"
  | "PLUGIN_DEPENDENCY_MISSING"
  | "PLUGIN_DEPENDENCY_CYCLE"
  | "LIFECYCLE_HOOK_FAILED";

export interface CoreErrorOptions {
  code: CoreErrorCode;
  message: string;
  cause?: unknown;
  pluginName?: PluginName;
}

export class CoreError extends Error {
  readonly code: CoreErrorCode;
  readonly severity = "fatal";
  readonly source = "core";
  readonly cause: unknown | undefined;
  readonly pluginName: PluginName | undefined;

  constructor(options: CoreErrorOptions) {
    super(options.message);
    this.name = "CoreError";
    this.code = options.code;
    this.cause = options.cause;
    this.pluginName = options.pluginName;
  }
}
