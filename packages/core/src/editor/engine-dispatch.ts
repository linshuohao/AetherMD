import type { AetherBlock, AetherDoc, AetherInline, AetherSchema } from "../document-model.js";
import type {
  AdapterCommandRequest,
  EngineAdapter,
  EngineSession,
} from "../adapter-types.js";
import type { CommandId, CommandRequest } from "../command-event-types.js";
import type { CommandEventRuntime } from "../command-event-runtime.js";

export const ENGINE_REPLACE_TEXT_COMMAND = "core:replaceText" as CommandId;

export interface EngineDispatchDeps {
  engine: EngineAdapter;
  session: EngineSession;
  schema: AetherSchema;
  runtime: CommandEventRuntime;
  getDoc: () => AetherDoc;
  setDoc: (doc: AetherDoc) => void;
}

export function isEngineBoundCommand(id: CommandId): boolean {
  return id === ENGINE_REPLACE_TEXT_COMMAND;
}

export function toAdapterCommand(request: CommandRequest): AdapterCommandRequest | null {
  if (request.id !== ENGINE_REPLACE_TEXT_COMMAND) {
    return null;
  }
  const payload = request.payload as
    | {
        blockIndex?: number;
        text?: string;
        children?: AetherInline[];
        replacement?: AetherBlock;
      }
    | undefined;
  if (payload?.blockIndex === undefined) {
    return null;
  }
  if (
    payload.replacement === undefined &&
    payload.text === undefined &&
    payload.children === undefined
  ) {
    return null;
  }
  return {
    type: "replaceText",
    blockIndex: payload.blockIndex,
    ...(payload.text !== undefined ? { text: payload.text } : {}),
    ...(payload.children !== undefined ? { children: payload.children } : {}),
    ...(payload.replacement !== undefined
      ? { replacement: payload.replacement }
      : {}),
  };
}

export async function dispatchEngineCommand(
  deps: EngineDispatchDeps,
  request: CommandRequest,
): Promise<{ ok: true; doc: AetherDoc } | { ok: false; restored: AetherDoc }> {
  const adapterRequest = toAdapterCommand(request);
  if (!adapterRequest) {
    const restored = deps.getDoc();
    deps.runtime.emit({
      name: "transactionFailed",
      source: "core",
      timestamp: Date.now(),
      payload: {
        commandId: request.id,
        error: { message: "Invalid engine command payload" },
      },
    });
    return { ok: false, restored };
  }

  const snapshot = deps.getDoc();
  const result = await deps.engine.apply(deps.session, adapterRequest);

  if (!result.ok || !result.doc) {
    deps.setDoc(snapshot);
    deps.runtime.emit({
      name: "transactionFailed",
      source: "adapter",
      timestamp: Date.now(),
      payload: {
        commandId: request.id,
        error: result.error ?? { message: "Engine apply failed" },
      },
    });
    return { ok: false, restored: snapshot };
  }

  deps.setDoc(result.doc);
  deps.runtime.emit({
    name: "change",
    source: "core",
    timestamp: Date.now(),
    payload: { doc: result.doc },
  });
  return { ok: true, doc: result.doc };
}
