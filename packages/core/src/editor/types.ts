import type {
  CommandRequest,
  CommandResult,
  EventListener,
  EventName,
  Unsubscribe,
} from "../command-event/types.js";
import type { AetherBlock, AetherDoc } from "../document/model.js";
import type { ExtensionPlugin } from "../manifest/manifest.js";
import type { PermissionId } from "../types.js";
import type { ConflictResolver } from "./conflict-resolver.js";
import type { EditorContext } from "./context.js";
import type { SerializationError } from "../errors.js";
import type { TelemetryService } from "../telemetry/index.js";

export interface EditorSecurityConfig {
  grantedPermissions?: PermissionId[];
  defaultDeny?: PermissionId[];
}

export interface EditorWorkerConfig {
  /** Absolute path or file URL to the Node worker_threads entry module. */
  entry: string;
  parser?: boolean;
  serializer?: boolean;
}

export interface EditorConfig {
  plugins: readonly ExtensionPlugin[];
  initialValue?: string | AetherDoc;
  readOnly?: boolean;
  security?: EditorSecurityConfig;
  conflictResolver?: ConflictResolver;
  workers?: EditorWorkerConfig;
  telemetry?: TelemetryService;
}

export interface EditorStateSnapshot {
  readonly doc: AetherDoc;
  readonly readOnly: boolean;
}

export type MarkdownSerializeResult =
  | { readonly ok: true; readonly markdown: string }
  | { readonly ok: false; readonly error: SerializationError };

/** Opaque plugin-owned morphing registry handle exposed at the kernel boundary. */
export interface MorphingStrategyAccessor {
  get(blockType: AetherBlock["type"]): unknown;
  list(): readonly unknown[];
}

export interface AetherEditor {
  readonly context: EditorContext;
  readonly state: EditorStateSnapshot;
  readonly morphing: MorphingStrategyAccessor;

  dispatch(command: CommandRequest): Promise<CommandResult>;
  on(eventName: EventName, listener: EventListener): Unsubscribe;
  getMarkdown(): Promise<string>;
  tryGetMarkdown(): Promise<MarkdownSerializeResult>;
  getDocument(): AetherDoc;
  getMorphingStrategy(blockType: AetherBlock["type"]): unknown;
  dispose(): Promise<void>;
}
