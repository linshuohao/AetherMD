import { type AetherEditor } from "@aether-md/core";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h, watch } from "vue";

import { AetherEditorContent } from "./legacy.js";
import { AetherEditorRoot, AetherMorphingContent, useAetherEditor } from "./index.js";
import { createGfmEditorPlugins } from "./testing/gfm-plugins.js";

const MarkdownProbe = defineComponent({
  setup() {
    const shell = useAetherEditor();
    return () =>
      shell.ready ? h("div", { "data-testid": "markdown-probe" }, shell.markdown) : null;
  },
});

describe("GFM Vue smoke", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders and edits paragraph fixture through dispatch path", async () => {
    let capturedEditor: AetherEditor | null = null;

    const EditorCapture = defineComponent({
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

    const App = defineComponent({
      setup() {
        const plugins = createGfmEditorPlugins();
        return () =>
          h(
            AetherEditorRoot,
            {
              plugins,
              initialValue: "Hello world\n",
            },
            {
              default: () => [
                h(AetherEditorContent),
                h(MarkdownProbe),
                h(EditorCapture, {
                  onReady: (editor: AetherEditor) => {
                    capturedEditor = editor;
                  },
                }),
              ],
            },
          );
      },
    });

    const wrapper = mount(App, { attachTo: document.body });
    await flushPromises();
    await viWaitFor(() => {
      const probe = document.querySelector('[data-testid="markdown-probe"]');
      assert.ok(probe);
      assert.match(probe?.textContent ?? "", /Hello world/);
      assert.ok(capturedEditor);
    });

    const result = await capturedEditor!.dispatch({
      id: "core:replaceText",
      payload: { blockIndex: 0, text: "Edited paragraph" },
    });
    assert.equal(result.ok, true);

    await viWaitFor(() => {
      const probe = document.querySelector('[data-testid="markdown-probe"]');
      assert.match(probe?.textContent ?? "", /Edited paragraph/);
    });

    wrapper.unmount();
    await flushPromises();
  });

  it("renders strong inline fixture through Vue Shell", async () => {
    const App = defineComponent({
      setup() {
        const plugins = createGfmEditorPlugins();
        return () =>
          h(
            AetherEditorRoot,
            {
              plugins,
              initialValue: "**bold**\n",
            },
            {
              default: () => [h(AetherEditorContent), h(MarkdownProbe)],
            },
          );
      },
    });

    const wrapper = mount(App, { attachTo: document.body });
    await flushPromises();

    await viWaitFor(() => {
      const probe = document.querySelector('[data-testid="markdown-probe"]');
      assert.ok(probe);
      assert.match(probe?.textContent ?? "", /bold/);
    });

    wrapper.unmount();
    await flushPromises();
  });

  it("renders morphing content surface as supported primary shell", async () => {
    const App = defineComponent({
      setup() {
        const plugins = createGfmEditorPlugins();
        return () =>
          h(
            AetherEditorRoot,
            {
              plugins,
              initialValue: "**bold**\n",
            },
            {
              default: () => [h(AetherMorphingContent), h(MarkdownProbe)],
            },
          );
      },
    });

    const wrapper = mount(App, { attachTo: document.body });
    await flushPromises();

    await viWaitFor(() => {
      const shell = document.querySelector('[data-testid="aether-morphing-content"]');
      assert.ok(shell);
      assert.equal(shell?.getAttribute("data-ready"), "true");
      assert.ok(document.querySelector('[data-testid="morphing-rendered"]'));
    });

    wrapper.unmount();
    await flushPromises();
  });

  it("focuses morphing source textarea when block enters source state", async () => {
    const App = defineComponent({
      setup() {
        const plugins = createGfmEditorPlugins();
        return () =>
          h(
            AetherEditorRoot,
            {
              plugins,
              initialValue: "**bold**\n",
            },
            {
              default: () => [h(AetherMorphingContent)],
            },
          );
      },
    });

    const wrapper = mount(App, { attachTo: document.body });
    await flushPromises();

    await viWaitFor(() => {
      assert.ok(document.querySelector('[data-testid="morphing-rendered"]'));
    });

    const rendered = document.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;
    rendered.focus();

    await viWaitFor(() => {
      const source = document.querySelector(
        '[data-testid="morphing-source"]',
      ) as HTMLTextAreaElement;
      assert.ok(source);
      assert.equal(document.activeElement, source);
      assert.match(source.value, /\*\*bold\*\*/);
    });

    wrapper.unmount();
    await flushPromises();
  });
});

async function viWaitFor(assertion: () => void, timeout = 5000): Promise<void> {
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
