import { parentPort } from "node:worker_threads";

interface WorkerRequestEnvelope {
  id: string;
  type: "parse" | "serialize";
  payload: {
    markdown?: string;
    doc?: { type: string; children: unknown[] };
    schema: { version: number };
  };
}

if (!parentPort) {
  throw new Error("worker-fixture-entry must run inside a worker_threads Worker");
}

const port = parentPort;

port.on("message", (message: WorkerRequestEnvelope) => {
  if (message.type === "parse") {
    const markdown = message.payload.markdown ?? "";
    port.postMessage({
      id: message.id,
      ok: true,
      value: {
        doc: {
          type: "doc",
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", text: markdown }],
            },
          ],
        },
      },
    });
    return;
  }

  if (message.type === "serialize") {
    const text =
      (message.payload.doc?.children?.[0] as { children?: { text?: string }[] } | undefined)
        ?.children?.[0]?.text ?? "";
    port.postMessage({
      id: message.id,
      ok: true,
      value: { markdown: `${text}\n` },
    });
    return;
  }

  port.postMessage({
    id: message.id,
    ok: false,
    error: { message: "unknown request" },
  });
});
