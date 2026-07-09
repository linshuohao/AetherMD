import { createCommandEventRuntime } from "@aether-md/core/testing";
import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { PARSE_BLOCK_MARKDOWN_COMMAND } from "@aether-md/morphing-contracts";

import { registerGfmEditorCommands } from "./editor-commands.js";

describe("registerGfmEditorCommands", () => {
  it("registers core:parseBlockMarkdown and returns the first parsed block", async () => {
    const runtime = createCommandEventRuntime();
    const schema = { blocks: ["paragraph"] as const };

    registerGfmEditorCommands(runtime, {
      parser: {
        name: "test-parser",
        async parse(markdown, _schema) {
          assert.equal(markdown, "**bold**\n");
          return {
            type: "doc",
            children: [
              { type: "paragraph", children: [{ type: "text", text: "bold" }] },
              { type: "paragraph", children: [{ type: "text", text: "tail" }] },
            ],
          };
        },
      },
      schema,
    });

    const result = runtime.dispatch({
      id: PARSE_BLOCK_MARKDOWN_COMMAND,
      payload: { markdown: "**bold**\n" },
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      const block = (await result.value) as { type?: string };
      assert.equal(block.type, "paragraph");
    }
  });

  it("rejects payloads without markdown", () => {
    const runtime = createCommandEventRuntime();

    registerGfmEditorCommands(runtime, {
      parser: {
        name: "test-parser",
        async parse() {
          return { type: "doc", children: [] };
        },
      },
      schema: { blocks: ["paragraph"] as const },
    });

    const result = runtime.dispatch({
      id: PARSE_BLOCK_MARKDOWN_COMMAND,
      payload: {},
    });

    assert.equal(result.ok, false);
  });
});
