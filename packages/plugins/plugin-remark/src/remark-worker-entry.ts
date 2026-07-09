import { parentPort } from "node:worker_threads";

import { createRemarkParserAdapter } from "./parser.js";
import { createRemarkSerializerAdapter } from "./serializer.js";

interface WorkerRequestEnvelope {
  id: string;
  type: "parse" | "serialize";
  payload: {
    markdown?: string;
    doc?: import("@aether-md/core/document").AetherDoc;
    schema: import("@aether-md/core/document").AetherSchema;
  };
}

if (!parentPort) {
  throw new Error("remark-worker-entry must run inside a worker_threads Worker");
}

const parser = createRemarkParserAdapter();
const serializer = createRemarkSerializerAdapter();
const port = parentPort;

port.on("message", (message: WorkerRequestEnvelope) => {
  void handleMessage(message);
});

async function handleMessage(message: WorkerRequestEnvelope): Promise<void> {
  try {
    if (message.type === "parse") {
      const markdown = message.payload.markdown;
      if (typeof markdown !== "string") {
        throw new Error("Invalid parse payload");
      }
      const doc = await parser.parse(markdown, message.payload.schema);
      port.postMessage({ id: message.id, ok: true, value: { doc } });
      return;
    }

    if (message.type === "serialize") {
      const doc = message.payload.doc;
      if (!doc) {
        throw new Error("Invalid serialize payload");
      }
      const markdown = await serializer.serialize(doc, message.payload.schema);
      port.postMessage({ id: message.id, ok: true, value: { markdown } });
      return;
    }

    port.postMessage({
      id: message.id,
      ok: false,
      error: { message: `Unknown worker request type: ${message.type as string}` },
    });
  } catch (error) {
    port.postMessage({
      id: message.id,
      ok: false,
      error: {
        message: error instanceof Error ? error.message : "Worker request failed",
      },
    });
  }
}
