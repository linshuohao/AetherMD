/** Adapter implementer entry — parser/serializer/engine protocol and helpers. */
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
export type {
  AdapterErrorCode,
  AdapterErrorOptions,
  SerializationErrorCode,
  SerializationErrorOptions,
} from "./errors.js";
export { AdapterError, SerializationError, toSerializationError } from "./errors.js";
export {
  ENGINE_MOVE_BLOCK_COMMAND,
  ENGINE_REPLACE_TEXT_COMMAND,
} from "./editor/engine-dispatch.js";
export { CORE_REDO_COMMAND, CORE_UNDO_COMMAND } from "./services/index.js";
