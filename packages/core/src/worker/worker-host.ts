import { CoreError } from "../errors.js";
import type {
  WorkerParsePayload,
  WorkerParseResult,
  WorkerRequestEnvelope,
  WorkerSerializePayload,
  WorkerSerializeResult,
} from "./protocol.js";
import { isWorkerResponseEnvelope } from "./protocol.js";

export interface WorkerHost {
  requestParse(payload: WorkerParsePayload): Promise<WorkerParseResult>;
  requestSerialize(payload: WorkerSerializePayload): Promise<WorkerSerializeResult>;
  dispose(): Promise<void>;
}

interface PendingRequest {
  resolve(value: unknown): void;
  reject(error: unknown): void;
}

export async function createNodeWorkerHost(entry: string): Promise<WorkerHost> {
  if (typeof process === "undefined" || !process.versions?.node) {
    throw new CoreError({
      code: "MANIFEST_INVALID",
      message: "Worker runtime requires Node.js worker_threads",
    });
  }

  const { Worker } = await import("node:worker_threads");
  return new NodeWorkerHost(Worker, entry);
}

class NodeWorkerHost implements WorkerHost {
  private readonly worker: import("node:worker_threads").Worker;
  private readonly pending = new Map<string, PendingRequest>();
  private nextId = 0;
  private disposed = false;

  constructor(WorkerCtor: typeof import("node:worker_threads").Worker, entry: string) {
    this.worker = new WorkerCtor(entry);
    this.worker.on("message", (message: unknown) => {
      if (!isWorkerResponseEnvelope(message)) {
        return;
      }
      const pending = this.pending.get(message.id);
      if (!pending) {
        return;
      }
      this.pending.delete(message.id);
      if (message.ok) {
        pending.resolve(message.value);
        return;
      }
      pending.reject(
        new CoreError({
          code: "COMMAND_UNKNOWN",
          message: message.error.message,
          severity: "recoverable",
        }),
      );
    });
    this.worker.on("error", (error: Error) => {
      for (const pending of this.pending.values()) {
        pending.reject(error);
      }
      this.pending.clear();
    });
  }

  requestParse(payload: WorkerParsePayload): Promise<WorkerParseResult> {
    return this.request<WorkerParseResult>("parse", payload);
  }

  requestSerialize(payload: WorkerSerializePayload): Promise<WorkerSerializeResult> {
    return this.request<WorkerSerializeResult>("serialize", payload);
  }

  async dispose(): Promise<void> {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    await this.worker.terminate();
    this.pending.clear();
  }

  private request<TValue>(
    type: WorkerRequestEnvelope["type"],
    payload: WorkerRequestEnvelope["payload"],
  ): Promise<TValue> {
    if (this.disposed) {
      return Promise.reject(
        new CoreError({
          code: "RUNTIME_DISPOSED",
          message: "Worker host has been disposed",
          severity: "recoverable",
        }),
      );
    }

    const id = String(++this.nextId);
    const envelope: WorkerRequestEnvelope = { id, type, payload };

    return new Promise<TValue>((resolve, reject) => {
      this.pending.set(id, {
        resolve: (value) => resolve(value as TValue),
        reject,
      });
      this.worker.postMessage(envelope);
    });
  }
}
