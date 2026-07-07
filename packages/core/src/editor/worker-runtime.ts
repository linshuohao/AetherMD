import { CoreError } from "../errors.js";
import type { PermissionId } from "../types.js";
import { createNodeWorkerHost } from "../worker/worker-host.js";
import {
  createWorkerParserAdapter,
  createWorkerSerializerAdapter,
} from "../worker/wrap-adapters.js";
import type { EditorWorkerConfig } from "./types.js";
import type { WiredAdapters } from "./adapter-wiring.js";

export type { EditorWorkerConfig };

export interface WorkerRuntimeHandle {
  dispose(): Promise<void>;
}

const WORKER_PERMISSION: PermissionId = "perm:worker";

export async function applyWorkerRuntime(
  wired: WiredAdapters,
  workers: EditorWorkerConfig | undefined,
  grantedPermissions: ReadonlySet<PermissionId>,
): Promise<{ wired: WiredAdapters; handle: WorkerRuntimeHandle }> {
  if (!workers) {
    return { wired, handle: noopWorkerRuntimeHandle };
  }

  if (!workers.parser && !workers.serializer) {
    return { wired, handle: noopWorkerRuntimeHandle };
  }

  if (!grantedPermissions.has(WORKER_PERMISSION)) {
    throw new CoreError({
      code: "PERMISSION_DENIED",
      message: `Worker runtime requires ${WORKER_PERMISSION}`,
      severity: "fatal",
    });
  }

  const host = await createNodeWorkerHost(workers.entry);
  const next: WiredAdapters = { ...wired };

  if (workers.parser) {
    next.parser = createWorkerParserAdapter(host, wired.parser.name);
  }
  if (workers.serializer) {
    next.serializer = createWorkerSerializerAdapter(host, wired.serializer.name);
  }

  return {
    wired: next,
    handle: {
      dispose: () => host.dispose(),
    },
  };
}

const noopWorkerRuntimeHandle: WorkerRuntimeHandle = {
  async dispose() {},
};
