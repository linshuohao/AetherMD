import type {
  CommandHandler,
  CommandId,
  CommandRequest,
  CommandResult,
  EventEnvelope,
  EventListener,
  EventName,
  Unsubscribe,
} from "./command-event-types.js";
import { CoreError, PluginError } from "./errors.js";

export interface CommandEventRuntime {
  register(id: CommandId, handler: CommandHandler): void;
  dispatch(command: CommandRequest): CommandResult;
  on(eventName: EventName, listener: EventListener): Unsubscribe;
  emit(event: EventEnvelope): void;
  dispose(): void;
}

/** M2 Command/Event runtime. Independent of bootstrapCore. */
export function createCommandEventRuntime(): CommandEventRuntime {
  const listeners = new Map<EventName, Set<EventListener>>();
  const handlers = new Map<CommandId, CommandHandler>();
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

  return {
    register(id, handler) {
      if (disposed) {
        return;
      }
      handlers.set(id, handler);
    },
    dispatch(command) {
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

      const handler = handlers.get(command.id);
      if (!handler) {
        return {
          ok: false,
          error: new CoreError({
            code: "COMMAND_UNKNOWN",
            message: `Unknown command: ${command.id}`,
            severity: "recoverable",
          }),
        };
      }

      try {
        const returned = handler(command);
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
          message:
            cause instanceof Error ? cause.message : "Command handler failed",
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
    },
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
