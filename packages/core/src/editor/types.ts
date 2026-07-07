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
import type { MorphingStrategyRegistry } from "../morphing/types.js";
import type { ConflictResolver } from "./conflict-resolver.js";
import type { EditorContext } from "./context.js";
import type { SerializationError } from "../errors.js";

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
}

export interface EditorStateSnapshot {
  readonly doc: AetherDoc;
  readonly readOnly: boolean;
}

export type MarkdownSerializeResult =
  | { readonly ok: true; readonly markdown: string }
  | { readonly ok: false; readonly error: SerializationError };

export interface AetherEditor {
  readonly context: EditorContext;
  readonly state: EditorStateSnapshot;
  readonly morphing: MorphingStrategyRegistry;

  dispatch(command: CommandRequest): Promise<CommandResult>;
  on(eventName: EventName, listener: EventListener): Unsubscribe;
  getMarkdown(): Promise<string>;
  tryGetMarkdown(): Promise<MarkdownSerializeResult>;
  getDocument(): AetherDoc;
  getMorphingStrategy(blockType: AetherBlock["type"]): ReturnType<MorphingStrategyRegistry["get"]>;
  dispose(): Promise<void>;
}
