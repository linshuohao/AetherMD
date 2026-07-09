/** Host / Shell entry — create and operate an editor instance. */
export type {
  CommandRequest,
  CommandResult,
  EventListener,
  EventName,
  Unsubscribe,
} from "./command-event/types.js";
export type { AetherDoc } from "./document/model.js";
export type {
  CoreErrorCode,
  CoreErrorOptions,
  RenderErrorCode,
  RenderErrorOptions,
} from "./errors.js";
export { CoreError, RenderError } from "./errors.js";
export { createEditor } from "./editor/create-editor.js";
export type {
  AetherEditor,
  EditorConfig,
  EditorSecurityConfig,
  EditorStateSnapshot,
  EditorWorkerConfig,
  MarkdownSerializeResult,
} from "./editor/types.js";
export type { ExtensionPlugin } from "./manifest/manifest.js";
