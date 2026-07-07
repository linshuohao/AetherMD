import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h, ref, watch } from "vue";

import type { AetherEditor } from "@aether-md/core";

import { AetherEditorContent } from "../legacy.js";
import { AetherEditorRoot, useAetherEditor } from "../index.js";
import { createGfmEditorPlugins } from "../testing/gfm-plugins.js";

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
    return () => h("div", { "data-testid": "markdown-probe" }, shell.markdown);
  },
});

describe("GateLock integration (ci-checklist #41)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("does not remount editor when onChange echoes edited markdown back to value", async () => {
    let capturedEditor: AetherEditor | null = null;

    const ControlledShell = defineComponent({
      setup() {
        const markdown = ref("Hello world\n");
        const plugins = createGfmEditorPlugins();
        return () =>
          h(
            AetherEditorRoot,
            {
              plugins,
              value: markdown.value,
              onChange: (next: string) => {
                markdown.value = next;
              },
            },
            {
              default: () => [
                h(AetherEditorContent),
                h(EditorProbe, {
                  onReady: (editor: AetherEditor) => {
                    capturedEditor = editor;
                  },
                }),
              ],
            },
          );
      },
    });

    const wrapper = mount(ControlledShell, { attachTo: document.body });
    await flushPromises();
    await waitFor(() => assert.ok(capturedEditor));

    const editorBeforeEdit = capturedEditor;

    const result = await capturedEditor!.dispatch({
      id: "core:replaceText",
      payload: { blockIndex: 0, text: "Hello AetherMD" },
    });
    assert.equal(result.ok, true);

    await waitFor(() => {
      const probe = document.querySelector('[data-testid="markdown-probe"]');
      assert.match(probe?.textContent ?? "", /Hello AetherMD/);
      assert.equal(capturedEditor, editorBeforeEdit);
      assert.ok(document.querySelector(".ProseMirror"));
    });

    wrapper.unmount();
    await flushPromises();
  });

  it("does not reset document when controlled value re-renders with the same markdown string", async () => {
    let capturedEditor: AetherEditor | null = null;
    const bumpRender = ref(0);

    const ControlledShell = defineComponent({
      setup() {
        const plugins = createGfmEditorPlugins();
        return () => {
          void bumpRender.value;
          return h(
            AetherEditorRoot,
            {
              plugins,
              value: "Hello world\n",
            },
            {
              default: () => [
                h(AetherEditorContent),
                h(EditorProbe, {
                  onReady: (editor: AetherEditor) => {
                    capturedEditor = editor;
                  },
                }),
              ],
            },
          );
        };
      },
    });

    const wrapper = mount(ControlledShell, { attachTo: document.body });
    await flushPromises();
    await waitFor(() => assert.ok(capturedEditor));

    const result = await capturedEditor!.dispatch({
      id: "core:replaceText",
      payload: { blockIndex: 0, text: "Hello AetherMD" },
    });
    assert.equal(result.ok, true);
    const markdown = await capturedEditor!.getMarkdown();
    assert.match(markdown, /Hello AetherMD/);

    await waitFor(() => {
      const probe = document.querySelector('[data-testid="markdown-probe"]');
      assert.match(probe?.textContent ?? "", /Hello AetherMD/);
    });

    bumpRender.value += 1;
    await flushPromises();

    await waitFor(() => {
      const probe = document.querySelector('[data-testid="markdown-probe"]');
      assert.match(probe?.textContent ?? "", /Hello AetherMD/);
    });

    wrapper.unmount();
    await flushPromises();
  });
});

async function waitFor(assertion: () => void, timeout = 5000): Promise<void> {
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
