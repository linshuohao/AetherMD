import type { CommandEventRuntime } from "../command-event/runtime.js";
import { createCommandEventRuntime, type CommandRuntimeOptions } from "../command-event/runtime.js";
import { runReadOnlyGuard } from "../command-event/pipeline.js";
import type { CommandRegistrationMeta } from "../command-event/pipeline.js";
import type {
  CommandHandler,
  CommandId,
  CommandRequest,
  CommandResult,
  EventListener,
  EventName,
  Unsubscribe,
} from "../command-event/types.js";
import type { AetherBlock, AetherDoc, AetherSchema } from "../document/model.js";
import { CoreError, SerializationError, toSerializationError } from "../errors.js";
import type { EngineSession } from "../document/adapter-types.js";
import type { CoreBootstrapRuntime } from "../bootstrap/bootstrap.js";
import {
  PARSE_BLOCK_MARKDOWN_COMMAND,
  type MorphingStrategyRegistry,
  type ParseBlockMarkdownPayload,
} from "../morphing/types.js";
import type { PermissionId } from "../types.js";
import {
  CORE_REDO_COMMAND,
  CORE_UNDO_COMMAND,
  createClipboardService,
  createDocumentHistory,
  createHistoryService,
  createSelectionService,
} from "../services/index.js";
import type { EditorContext } from "./context.js";
import { createDefaultConflictResolver, type ConflictResolver } from "./conflict-resolver.js";
import {
  applyDocumentToEngine,
  dispatchEngineCommand,
  isEngineBoundCommand,
  type EngineDispatchDeps,
} from "./engine-dispatch.js";
import type { EditorStateSnapshot, AetherEditor, MarkdownSerializeResult } from "./types.js";
import type { WorkerRuntimeHandle } from "./worker-runtime.js";

export interface EditorRuntimeFactoryOptions extends CommandRuntimeOptions {
  conflictResolver?: ConflictResolver;
}

function cloneDoc(doc: AetherDoc): AetherDoc {
  return structuredClone(doc);
}

export class AetherEditorImpl implements AetherEditor {
  readonly context: EditorContext;
  readonly morphing: MorphingStrategyRegistry;
  private readonly runtime: CommandEventRuntime;
  private readonly bootstrapRuntime: CoreBootstrapRuntime;
  private readonly session: EngineSession;
  private readonly engineDispatchDeps: EngineDispatchDeps;
  private docSnapshot: AetherDoc;
  private readonly readOnlyFlag: boolean;
  private readonly workerHandle: WorkerRuntimeHandle;
  private disposed = false;

  constructor(options: {
    context: EditorContext;
    runtime: CommandEventRuntime;
    bootstrapRuntime: CoreBootstrapRuntime;
    session: EngineSession;
    initialDoc: AetherDoc;
    readOnly: boolean;
    morphing: MorphingStrategyRegistry;
    schema: AetherSchema;
    workerHandle?: WorkerRuntimeHandle;
  }) {
    this.context = options.context;
    this.morphing = options.morphing;
    this.runtime = options.runtime;
    this.bootstrapRuntime = options.bootstrapRuntime;
    this.session = options.session;
    this.docSnapshot = cloneDoc(options.initialDoc);
    this.readOnlyFlag = options.readOnly;
    this.workerHandle = options.workerHandle ?? { dispose: async () => {} };
    this.engineDispatchDeps = {
      engine: options.context.services.engine.adapter,
      session: options.session,
      schema: options.schema,
      runtime: options.runtime,
      getDoc: () => this.docSnapshot,
      setDoc: (doc) => {
        this.docSnapshot = cloneDoc(doc);
      },
      history: options.context.documentHistory,
    };
  }

  get state(): EditorStateSnapshot {
    return {
      doc: cloneDoc(this.docSnapshot),
      readOnly: this.readOnlyFlag,
    };
  }

  async dispatch(command: CommandRequest): Promise<CommandResult> {
    if (this.disposed) {
      return {
        ok: false,
        error: new CoreError({
          code: "EDITOR_DISPOSED",
          message: "Editor has been disposed",
          severity: "recoverable",
        }),
      };
    }

    if (this.readOnlyFlag) {
      const guard = runReadOnlyGuard(
        { readOnly: true, providedCapabilities: new Set(), grantedPermissions: new Set() },
        command,
        {
          mutating: command.id !== CORE_UNDO_COMMAND && command.id !== CORE_REDO_COMMAND,
        },
      );
      if (guard) {
        return guard;
      }
    }

    if (command.id === PARSE_BLOCK_MARKDOWN_COMMAND) {
      const payload = command.payload as ParseBlockMarkdownPayload | undefined;
      if (!payload || typeof payload.markdown !== "string") {
        return {
          ok: false,
          error: new CoreError({
            code: "COMMAND_UNKNOWN",
            message: "Invalid parseBlockMarkdown payload",
            severity: "recoverable",
          }),
        };
      }

      const parsed = await this.context.services.parser.adapter.parse(
        payload.markdown,
        this.engineDispatchDeps.schema,
      );
      const block = parsed.children[0] as AetherBlock | undefined;
      return { ok: true, value: block };
    }

    if (command.id === CORE_UNDO_COMMAND) {
      const restored = this.context.documentHistory.undo(this.docSnapshot);
      if (!restored) {
        return { ok: false };
      }
      const result = await applyDocumentToEngine(this.engineDispatchDeps, restored);
      return result.ok ? { ok: true } : { ok: false };
    }

    if (command.id === CORE_REDO_COMMAND) {
      const restored = this.context.documentHistory.redo(this.docSnapshot);
      if (!restored) {
        return { ok: false };
      }
      const result = await applyDocumentToEngine(this.engineDispatchDeps, restored);
      return result.ok ? { ok: true } : { ok: false };
    }

    if (isEngineBoundCommand(command.id)) {
      const result = await dispatchEngineCommand(this.engineDispatchDeps, command);
      return result.ok ? { ok: true } : { ok: false };
    }

    return Promise.resolve(this.runtime.dispatch(command));
  }

  on(eventName: EventName, listener: EventListener): Unsubscribe {
    return this.runtime.on(eventName, listener);
  }

  getDocument(): AetherDoc {
    return cloneDoc(this.docSnapshot);
  }

  getMorphingStrategy(blockType: AetherBlock["type"]) {
    return this.morphing.get(blockType);
  }

  async getMarkdown(): Promise<string> {
    const result = await this.tryGetMarkdown();
    if (!result.ok) {
      throw result.error;
    }
    return result.markdown;
  }

  async tryGetMarkdown(): Promise<MarkdownSerializeResult> {
    if (this.disposed) {
      return {
        ok: false,
        error: new SerializationError({
          code: "SERIALIZE_FAILED",
          message: "Editor has been disposed",
        }),
      };
    }

    try {
      const markdown = await this.context.services.parser.serializer.serialize(
        this.docSnapshot,
        this.engineDispatchDeps.schema,
      );
      return { ok: true, markdown };
    } catch (error) {
      const serializationError = toSerializationError(error);
      this.context.logger.error(serializationError.message);
      this.runtime.emit({
        name: "serializationError",
        source: "core",
        timestamp: Date.now(),
        payload: { error: serializationError },
      });
      return { ok: false, error: serializationError };
    }
  }

  async dispose(): Promise<void> {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    await this.workerHandle.dispose();
    await this.context.services.engine.adapter.dispose(this.session);
    await this.bootstrapRuntime.dispose();
    this.runtime.emit({
      name: "disposed",
      source: "core",
      timestamp: Date.now(),
    });
    this.runtime.dispose();
  }
}

export function createEditorRuntime(
  options: EditorRuntimeFactoryOptions = {},
): CommandEventRuntime {
  const runtime = createCommandEventRuntime(options);
  const registered = new Map<CommandId, CommandHandler>();
  const conflictResolver = options.conflictResolver ?? createDefaultConflictResolver();

  return {
    register(id, handler, meta) {
      registerWithConflictResolution(
        runtime,
        registered,
        id,
        handler,
        (existing, incoming) => {
          const resolution = conflictResolver.resolve({
            type: "command",
            existing: { value: existing },
            incoming: { value: incoming },
          });
          if (resolution.strategy === "abort") {
            throw new CoreError({
              code: "MANIFEST_INVALID",
              message: "Command registration conflict aborted",
            });
          }
          return (resolution.winner ?? incoming) as CommandHandler;
        },
        meta,
      );
    },
    dispatch: (command) => runtime.dispatch(command),
    dispatchBatch: (commands) => runtime.dispatchBatch(commands),
    on: (eventName, listener) => runtime.on(eventName, listener),
    emit: (event) => runtime.emit(event),
    dispose: () => runtime.dispose(),
  };
}

export function registerWithConflictResolution(
  runtime: CommandEventRuntime,
  registered: Map<CommandId, CommandHandler>,
  id: CommandId,
  handler: CommandHandler,
  resolveConflict: (existing: CommandHandler, incoming: CommandHandler) => CommandHandler,
  meta?: CommandRegistrationMeta,
): void {
  const existing = registered.get(id);
  if (existing) {
    const winner = resolveConflict(existing, handler);
    registered.set(id, winner);
    runtime.register(id, winner, meta);
    return;
  }
  registered.set(id, handler);
  runtime.register(id, handler, meta);
}

export function createBuiltinServicesForEditor(
  engine: EditorContext["services"]["engine"]["adapter"],
  session: EngineSession,
  grantedPermissions: ReadonlySet<PermissionId>,
) {
  const documentHistory = createDocumentHistory();
  return {
    documentHistory,
    history: createHistoryService(documentHistory),
    selection: createSelectionService(engine, session),
    clipboard: createClipboardService({ grantedPermissions }),
  };
}
