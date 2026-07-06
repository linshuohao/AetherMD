import type {
  CommandRequest,
  CommandResult,
  EventListener,
  EventName,
  Unsubscribe,
} from "../command-event-types.js";
import type { AetherBlock, AetherDoc } from "../document-model.js";
import type { ExtensionPlugin } from "../manifest.js";
import type { PermissionId } from "../types.js";
import type { MorphingStrategyRegistry } from "../morphing-types.js";
import type { EditorContext } from "./context.js";

export interface EditorSecurityConfig {
  grantedPermissions?: PermissionId[];
  defaultDeny?: PermissionId[];
}

export interface EditorConfig {
  plugins: readonly ExtensionPlugin[];
  initialValue?: string | AetherDoc;
  readOnly?: boolean;
  security?: EditorSecurityConfig;
}

export interface EditorStateSnapshot {
  readonly doc: AetherDoc;
  readonly readOnly: boolean;
}

export interface AetherEditor {
  readonly context: EditorContext;
  readonly state: EditorStateSnapshot;
  readonly morphing: MorphingStrategyRegistry;

  dispatch(command: CommandRequest): Promise<CommandResult>;
  on(eventName: EventName, listener: EventListener): Unsubscribe;
  getMarkdown(): Promise<string>;
  getDocument(): AetherDoc;
  getMorphingStrategy(blockType: AetherBlock["type"]): ReturnType<MorphingStrategyRegistry["get"]>;
  dispose(): Promise<void>;
}
