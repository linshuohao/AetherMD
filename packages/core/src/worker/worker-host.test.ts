import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { resolveWorkerFixtureEntryPath } from "../testing/worker-entry-paths.js";
import { createNodeWorkerHost } from "./worker-host.js";

describe("createNodeWorkerHost", () => {
  it("round-trips parse and serialize requests", async () => {
    const host = await createNodeWorkerHost(resolveWorkerFixtureEntryPath());

    const parsed = await host.requestParse({
      markdown: "hello",
      schema: { version: 1 },
    });
    assert.equal(
      (parsed.doc.children[0] as { children: { text: string }[] }).children[0]?.text,
      "hello",
    );

    const serialized = await host.requestSerialize({
      doc: parsed.doc,
      schema: { version: 1 },
    });
    assert.equal(serialized.markdown, "hello\n");

    await host.dispose();
  });
});
