import assert from "node:assert/strict";
import { defineComponent, watch } from "vue";

import { useAetherEditor } from "../shell/use-aether-editor.js";

export const PARAGRAPH_MORPHING_FIXTURE = "Hello **world**\n";

export const INLINE_MARKS_MORPHING_FIXTURE =
  "Hello **bold** and *emphasis* with [link](https://example.com).\n";

export const MULTI_BLOCK_FOCUS_FIXTURE = "First **one**\n\nSecond **two**\n\nThird plain\n";

export const LIST_MORPHING_FIXTURE =
  "Intro paragraph\n\n- alpha\n- beta\n\n[link](https://example.com) tail\n";

export const EditorCapture = defineComponent({
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

export function queryBlock(index: number): HTMLElement {
  const block = document.querySelector(`[data-testid="morphing-block-${index}"]`);
  assert.ok(block, `expected morphing-block-${index}`);
  return block as HTMLElement;
}

export async function waitForMorphingDocumentReady(): Promise<void> {
  await waitFor(() => {
    assert.ok(
      document.querySelector('[data-testid="aether-morphing-document"][data-ready="true"]'),
    );
  });
}

export async function focusBlockSource(index: number): Promise<HTMLTextAreaElement> {
  const block = queryBlock(index);
  const rendered = block.querySelector('[data-testid="morphing-rendered"]') as HTMLElement;

  rendered.focus();

  await waitFor(() => {
    assert.ok(block.querySelector('[data-testid="morphing-source"]'));
  });

  return block.querySelector('[data-testid="morphing-source"]') as HTMLTextAreaElement;
}

export async function waitForBlockEditSynced(index: number): Promise<void> {
  await waitFor(() => {
    assert.equal(queryBlock(index).getAttribute("data-edit-synced"), "true");
  });
}

export function dispatchSourceInput(source: HTMLTextAreaElement, value: string): void {
  source.value = value;
  source.dispatchEvent(new Event("input", { bubbles: true }));
}

export function appendToSource(source: HTMLTextAreaElement, suffix: string): void {
  const end = source.value.length;
  source.setSelectionRange(end, end);
  dispatchSourceInput(source, source.value + suffix);
}

export function replaceSourceSelection(source: HTMLTextAreaElement, replacement: string): void {
  const start = source.selectionStart ?? 0;
  const end = source.selectionEnd ?? 0;
  const next = source.value.slice(0, start) + replacement + source.value.slice(end);
  dispatchSourceInput(source, next);
  const caret = start + replacement.length;
  source.setSelectionRange(caret, caret);
}

export function backspaceSource(source: HTMLTextAreaElement, count: number): void {
  const end = source.selectionStart ?? source.value.length;
  const start = Math.max(0, end - count);
  const next = source.value.slice(0, start) + source.value.slice(end);
  dispatchSourceInput(source, next);
  source.setSelectionRange(start, start);
}

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
