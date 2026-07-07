export type {
  CapabilityId,
  CoreCapabilityId,
  PermissionId,
  PluginCapabilityId,
  PluginName,
  VendorCapabilityId,
} from "./types.js";
export { M1_CORE_CAPABILITIES } from "./manifest/capabilities.js";
export type {
  CoreErrorCode,
  CoreErrorOptions,
  PluginErrorCode,
  PluginErrorOptions,
  AdapterErrorCode,
  AdapterErrorOptions,
  SerializationErrorCode,
  SerializationErrorOptions,
} from "./errors.js";
export { CoreError, PluginError, AdapterError, SerializationError } from "./errors.js";
export {
  bootstrapCore,
  type BootstrapCoreOptions,
  type CoreBootstrapRuntime,
} from "./bootstrap/bootstrap.js";
export { resolvePluginDependencyOrder } from "./manifest/dependencies.js";
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
export { createCommandEventRuntime, type CommandEventRuntime } from "./command-event/runtime.js";
export type {
  AetherBlock,
  AetherDoc,
  AetherInline,
  AetherSchema,
  CustomBlock,
  HeadingBlock,
  LinkInline,
  ListBlock,
  MarkedInline,
  ParagraphBlock,
  TextInline,
} from "./document/model.js";
export type {
  CustomBlockRenderer,
  MorphingBlockStrategy,
  MorphingStrategyRegistry,
  ParseBlockMarkdownPayload,
} from "./morphing/types.js";
export { PARSE_BLOCK_MARKDOWN_COMMAND, createMorphingStrategyRegistry } from "./morphing/types.js";
export {
  createBlockId,
  ensureBlockId,
  ensureDocumentBlockIds,
  findBlockIndexById,
  moveBlockInDocument,
  withPreservedBlockId,
} from "./document/block-ids.js";
export type {
  AdapterCommandRequest,
  AdapterEvent,
  AdapterTransactionResult,
  EngineAdapter,
  EngineSession,
  EngineSelectionSnapshot,
  ParserAdapter,
  ReplaceTextCommand,
  SetDocumentCommand,
  SerializerAdapter,
} from "./document/adapter-types.js";
export {
  ENGINE_MOVE_BLOCK_COMMAND,
  ENGINE_REPLACE_TEXT_COMMAND,
} from "./editor/engine-dispatch.js";
export {
  CORE_REDO_COMMAND,
  CORE_UNDO_COMMAND,
  createClipboardService,
  createDocumentHistory,
  createHistoryService,
  createSelectionService,
  isSelectionCapableEngine,
  type ClipboardService,
  type DocumentHistory,
  type EditorSelection,
  type HistoryService,
  type SelectionCapableEngine,
  type SelectionService,
} from "./services/index.js";
export { createEditor } from "./editor/create-editor.js";
export type {
  AetherEditor,
  EditorConfig,
  EditorSecurityConfig,
  EditorStateSnapshot,
  EditorWorkerConfig,
} from "./editor/types.js";
