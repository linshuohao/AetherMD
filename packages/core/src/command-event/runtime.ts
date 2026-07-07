import type {
  CommandHandler,
  CommandId,
  CommandRequest,
  CommandResult,
  EventEnvelope,
  EventListener,
  EventName,
  Unsubscribe,
} from "./types.js";
import { CoreError, PluginError } from "../errors.js";
import {
  runCommandPipelineGuards,
  type CommandPipelineContext,
  type CommandRegistrationMeta,
} from "./pipeline.js";
import { CommandPriorityQueue } from "./queue.js";

export interface CommandEventRuntime {
  register(id: CommandId, handler: CommandHandler, meta?: CommandRegistrationMeta): void;
  dispatch(command: CommandRequest): CommandResult;
  dispatchBatch(commands: readonly CommandRequest[]): CommandResult[];
  on(eventName: EventName, listener: EventListener): Unsubscribe;
  emit(event: EventEnvelope): void;
  dispose(): void;
}

export interface CommandRuntimeOptions {
  pipeline?: CommandPipelineContext;
}

interface StoredRegistration {
  handler: CommandHandler;
  meta: CommandRegistrationMeta;
}

/** M2 Command/Event runtime with optional Guard pipeline and priority batch dispatch. */
export function createCommandEventRuntime(
  options: CommandRuntimeOptions = {},
): CommandEventRuntime {
  const listeners = new Map<EventName, Set<EventListener>>();
  const handlers = new Map<CommandId, StoredRegistration>();
  const pipelineContext: CommandPipelineContext = options.pipeline ?? {
    readOnly: false,
    providedCapabilities: new Set(),
  };
  let disposed = false;

  const emit = (event: EventEnvelope): void => {
    if (disposed) {
      return;
    }
    const set = listeners.get(event.name);
    if (!set) {
      return;
    }
    for (const listener of set) {
      listener(event);
    }
  };

  const execute = (command: CommandRequest): CommandResult => {
    if (disposed) {
      return {
        ok: false,
        error: new CoreError({
          code: "RUNTIME_DISPOSED",
          message: "Command/Event runtime has been disposed",
          severity: "recoverable",
        }),
      };
    }

    const registration = handlers.get(command.id);
    if (!registration) {
      return {
        ok: false,
        error: new CoreError({
          code: "COMMAND_UNKNOWN",
          message: `Unknown command: ${command.id}`,
          severity: "recoverable",
        }),
      };
    }

    const guardResult = runCommandPipelineGuards(pipelineContext, command, registration.meta);
    if (guardResult) {
      return guardResult;
    }

    try {
      const returned = registration.handler(command);
      if (returned === false) {
        return { ok: false };
      }
      if (returned && typeof returned === "object" && "value" in returned) {
        return { ok: true, value: returned.value };
      }
      return { ok: true };
    } catch (cause) {
      const pluginName = command.meta?.pluginName;
      const error = new PluginError({
        message: cause instanceof Error ? cause.message : "Command handler failed",
        cause,
        ...(pluginName !== undefined ? { pluginName } : {}),
      });
      emit({
        name: "pluginError",
        source: "plugin",
        timestamp: Date.now(),
        payload: { error },
        ...(pluginName !== undefined ? { pluginName } : {}),
      });
      return { ok: false, error };
    }
  };

  const dispatchBatch = (commands: readonly CommandRequest[]): CommandResult[] => {
    const queue = new CommandPriorityQueue();
    for (const command of commands) {
      queue.enqueue(command);
    }
    return queue.drainSorted().map((command) => execute(command));
  };

  return {
    register(id, handler, meta = {}) {
      if (disposed) {
        return;
      }
      handlers.set(id, { handler, meta });
    },
    dispatch(command) {
      return dispatchBatch([command])[0] ?? { ok: false };
    },
    dispatchBatch,
    on(eventName, listener) {
      if (disposed) {
        return () => {};
      }
      let set = listeners.get(eventName);
      if (!set) {
        set = new Set();
        listeners.set(eventName, set);
      }
      set.add(listener);
      return () => {
        set.delete(listener);
        if (set.size === 0) {
          listeners.delete(eventName);
        }
      };
    },
    emit,
    dispose() {
      if (disposed) {
        return;
      }
      disposed = true;
      listeners.clear();
      handlers.clear();
    },
  };
}
