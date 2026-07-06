import type { CommandEventRuntime } from "../command-event-runtime.js";
import { createCommandEventRuntime } from "../command-event-runtime.js";
import type {
  CommandHandler,
  CommandId,
  CommandRequest,
  CommandResult,
  EventListener,
  EventName,
  Unsubscribe,
} from "../command-event-types.js";
import type { AetherBlock, AetherDoc } from "../document-model.js";
import { CoreError } from "../errors.js";
import type { EngineSession } from "../adapter-types.js";
import type { CoreBootstrapRuntime } from "../bootstrap.js";
import {
  PARSE_BLOCK_MARKDOWN_COMMAND,
  type MorphingStrategyRegistry,
  type ParseBlockMarkdownPayload,
} from "../morphing-types.js";
import type { EditorContext } from "./context.js";
import { createDefaultConflictResolver } from "./conflict-resolver.js";
import { dispatchEngineCommand, isEngineBoundCommand } from "./engine-dispatch.js";
import type { EditorStateSnapshot, AetherEditor } from "./types.js";

const DEFAULT_SCHEMA = { version: 1 as const };

function cloneDoc(doc: AetherDoc): AetherDoc {
  return structuredClone(doc);
}

export class AetherEditorImpl implements AetherEditor {
  readonly context: EditorContext;
  readonly morphing: MorphingStrategyRegistry;
  private readonly runtime: CommandEventRuntime;
  private readonly bootstrapRuntime: CoreBootstrapRuntime;
  private readonly session: EngineSession;
  private docSnapshot: AetherDoc;
  private readonly readOnlyFlag: boolean;
  private disposed = false;

  constructor(options: {
    context: EditorContext;
    runtime: CommandEventRuntime;
    bootstrapRuntime: CoreBootstrapRuntime;
    session: EngineSession;
    initialDoc: AetherDoc;
    readOnly: boolean;
    morphing: MorphingStrategyRegistry;
  }) {
    this.context = options.context;
    this.morphing = options.morphing;
    this.runtime = options.runtime;
    this.bootstrapRuntime = options.bootstrapRuntime;
    this.session = options.session;
    this.docSnapshot = cloneDoc(options.initialDoc);
    this.readOnlyFlag = options.readOnly;
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
      return {
        ok: false,
        error: new CoreError({
          code: "COMMAND_UNKNOWN",
          message: "Editor is read-only",
          severity: "recoverable",
        }),
      };
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
        DEFAULT_SCHEMA,
      );
      const block = parsed.children[0] as AetherBlock | undefined;
      return { ok: true, value: block };
    }

    if (isEngineBoundCommand(command.id)) {
      const result = await dispatchEngineCommand(
        {
          engine: this.context.services.engine.adapter,
          session: this.session,
          schema: DEFAULT_SCHEMA,
          runtime: this.runtime,
          getDoc: () => this.docSnapshot,
          setDoc: (doc) => {
            this.docSnapshot = cloneDoc(doc);
          },
        },
        command,
      );
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
    return this.context.services.parser.serializer.serialize(this.docSnapshot, DEFAULT_SCHEMA);
  }

  async dispose(): Promise<void> {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
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

export function createEditorRuntime(): CommandEventRuntime {
  const runtime = createCommandEventRuntime();
  const registered = new Map<CommandId, CommandHandler>();
  const conflictResolver = createDefaultConflictResolver();

  return {
    register(id, handler) {
      registerWithConflictResolution(runtime, registered, id, handler, (existing, incoming) => {
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
      });
    },
    dispatch: (command) => runtime.dispatch(command),
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
): void {
  const existing = registered.get(id);
  if (existing) {
    const winner = resolveConflict(existing, handler);
    registered.set(id, winner);
    runtime.register(id, winner);
    return;
  }
  registered.set(id, handler);
  runtime.register(id, handler);
}
