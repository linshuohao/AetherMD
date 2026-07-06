import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createGfmPreset } from "../../../../preset-gfm/dist/index.js";
import type { ExtensionPlugin } from "../../../dist/manifest.js";
import { toExtensionPluginFromPreset } from "../../../dist/editor/adapter-wiring.js";
import { createEditor } from "../../../dist/editor/create-editor.js";
import {
  ENGINE_MOVE_BLOCK_COMMAND,
  ENGINE_REPLACE_TEXT_COMMAND,
} from "../../../dist/editor/engine-dispatch.js";

function createBootstrapStubPlugin(): ExtensionPlugin {
  return {
    manifest: {
      metadata: {
        manifestVersion: 1,
        name: "core-bootstrap-stub",
        provides: ["core:bootstrap"],
      },
    },
  };
}

function createRemarkStubPlugin(): ExtensionPlugin {
  return {
    manifest: {
      metadata: {
        manifestVersion: 1,
        name: "remark",
      },
    },
  };
}

function createProsemirrorStubPlugin(): ExtensionPlugin {
  return {
    manifest: {
      metadata: {
        manifestVersion: 1,
        name: "prosemirror",
      },
    },
  };
}

function createGfmEditorPlugins(): ExtensionPlugin[] {
  const preset = createGfmPreset();
  return [
    createBootstrapStubPlugin(),
    createRemarkStubPlugin(),
    createProsemirrorStubPlugin(),
    toExtensionPluginFromPreset(preset),
  ];
}

async function editAndSerialize(
  markdown: string,
  blockIndex: number,
  text: string,
): Promise<string> {
  const editor = await createEditor({
    plugins: createGfmEditorPlugins(),
    initialValue: markdown,
  });

  const result = await editor.dispatch({
    id: ENGINE_REPLACE_TEXT_COMMAND,
    payload: { blockIndex, text },
  });
  assert.equal(result.ok, true);

  const serialized = await editor.getMarkdown();
  await editor.dispose();
  return serialized;
}

describe("createEditor GFM headless integration", () => {
  it("round-trips paragraph through createEditor orchestration", async () => {
    const result = await editAndSerialize("Hello world\n", 0, "Hello AetherMD");
    assert.equal(result, "Hello AetherMD\n");
  });

  it("round-trips strong inline while editing an adjacent paragraph", async () => {
    const result = await editAndSerialize("**bold**\n\nTail\n", 1, "Updated tail");
    assert.equal(result, "**bold**\n\nUpdated tail\n");
  });

  it("round-trips unordered list with golden string output", async () => {
    const result = await editAndSerialize("- item one\n- item two\n\nTail\n", 1, "Updated tail");
    assert.equal(result, "- item one\n- item two\n\nUpdated tail\n");
  });

  it("moveBlock reorders blocks in-session while preserving stable ids", async () => {
    const editor = await createEditor({
      plugins: createGfmEditorPlugins(),
      initialValue: "First\n\nSecond\n\nThird\n",
    });

    const before = editor.getDocument();
    const blockId = before.children[1]?.id;
    assert.ok(blockId);

    const result = await editor.dispatch({
      id: ENGINE_MOVE_BLOCK_COMMAND,
      payload: { blockId, toIndex: 2 },
    });
    assert.equal(result.ok, true);

    const after = editor.getDocument();
    assert.equal(after.children[2]?.id, blockId);
    await editor.dispose();
  });

  it("does not import React or DOM bindings", () => {
    const sourcePath = fileURLToPath(import.meta.url);
    const source = readFileSync(sourcePath, "utf8");
    const importLines = source.split("\n").filter((line) => line.trimStart().startsWith("import "));

    for (const line of importLines) {
      assert.doesNotMatch(line, /@aether-md\/react|from ['"]react['"]|jsdom|happy-dom/i);
    }
  });
});
