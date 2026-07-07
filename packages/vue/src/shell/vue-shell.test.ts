import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h, watch } from "vue";

import type { AetherEditor } from "@aether-md/core";
import { createEditor } from "@aether-md/core";

import { AetherEditorContent, AetherEditorRoot, useAetherEditor } from "../index.js";
import { createGfmEditorPlugins } from "../testing/gfm-plugins.js";

describe("Vue Shell integration", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("createEditor works headlessly in vue test environment", async () => {
    const editor = await createEditor({
      plugins: createGfmEditorPlugins(),
      initialValue: "Hello world\n",
    });
    const markdown = await editor.getMarkdown();
    assert.match(markdown, /Hello world/);
    await editor.dispose();
  });

  it("mounts, emits onChange through dispatch path, and disposes on unmount", async () => {
    const changes: string[] = [];
    let capturedEditor: AetherEditor | null = null;
    const plugins = createGfmEditorPlugins();

    const EditorProbe = defineComponent({
      props: {
        onReady: {
          type: Function,
          required: true,
        },
      },
      setup(props) {
        const shell = useAetherEditor();
        watch(
          () => [shell.ready, shell.editor] as const,
          ([ready, editor]) => {
            if (ready && editor) {
              props.onReady(editor);
            }
          },
          { immediate: true },
        );
        return () => null;
      },
    });

    const wrapper = mount(AetherEditorRoot, {
      attachTo: document.body,
      props: {
        plugins,
        initialValue: "Hello world\n",
        onChange: (markdown: string) => {
          changes.push(markdown);
        },
      },
      slots: {
        default: () => [
          h(AetherEditorContent),
          h(EditorProbe, {
            onReady: (editor: AetherEditor) => {
              capturedEditor = editor;
            },
          }),
        ],
      },
    });
    await flushPromises();
    await waitFor(() => {
      assert.ok(capturedEditor);
      assert.ok(document.querySelector(".ProseMirror"));
    });

    const result = await capturedEditor!.dispatch({
      id: "core:replaceText",
      payload: { blockIndex: 0, text: "Hello AetherMD" },
    });
    assert.equal(result.ok, true);
    await flushPromises();

    await waitFor(() => {
      assert.ok(changes.some((markdown) => markdown.includes("Hello AetherMD")));
    });

    wrapper.unmount();
    await flushPromises();

    assert.equal(document.querySelector(".ProseMirror"), null);
  });
});

async function waitFor(assertion: () => void, timeout = 10000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      assertion();
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  assertion();
}
