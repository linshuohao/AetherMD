import type { PluginName } from "./types.js";

export type CommandId = `${string}:${string}`;

export type CommandSource = "user" | "plugin" | "shell" | "system";

export interface CommandMeta {
  history?: "capture" | "skip";
  priority?: "normal" | "high";
  pluginName?: PluginName;
}

export interface CommandRequest<TPayload = unknown> {
  id: CommandId;
  payload?: TPayload;
  source?: CommandSource;
  meta?: CommandMeta;
}

export type ErrorSeverity = "recoverable" | "degraded" | "fatal";

export interface AetherError {
  code: string;
  severity: ErrorSeverity;
  source: "core" | "plugin" | "adapter" | "render" | "serialization";
  message: string;
  cause?: unknown;
  pluginName?: PluginName;
}

export interface CommandResult<TValue = unknown> {
  ok: boolean;
  value?: TValue;
  error?: AetherError;
  events?: EventEnvelope[];
}

export type EventName =
  | "ready"
  | "change"
  | "transactionFailed"
  | "pluginError"
  | "disposed"
  | `${string}:${string}`;

export type EventSource = "core" | "plugin" | "adapter" | "shell";

export interface EventEnvelope<TPayload = unknown> {
  name: EventName;
  payload?: TPayload;
  source: EventSource;
  timestamp: number;
  pluginName?: PluginName;
}

export type Unsubscribe = () => void;

export type EventListener = (event: EventEnvelope) => void;

export type CommandHandler = (
  command: CommandRequest,
) => void | boolean | { value?: unknown };
