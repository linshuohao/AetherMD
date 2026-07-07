import assert from "node:assert/strict";
import React from "react";
import { act, fireEvent, waitFor } from "@testing-library/react";

import type { AetherEditor } from "@aether-md/core";

import { useAetherEditor } from "../shell/use-aether-editor.js";

export const SLICE_A_FIXTURE = "Hello **world**\n";

export const SLICE_B_FIXTURE = "Hello **bold** and *emphasis* with [link](https://example.com).\n";

export const SLICE_C_FIXTURE = "First **one**\n\nSecond **two**\n\nThird plain\n";

export const SLICE_D_FIXTURE =
  "Intro paragraph\n\n- alpha\n- beta\n\n[link](https://example.com) tail\n";

export function EditorCapture({ onReady }: { onReady: (editor: AetherEditor) => void }) {
  const { editor, ready } = useAetherEditor();
  React.useEffect(() => {
    if (ready && editor) {
      onReady(editor);
    }
  }, [ready, editor, onReady]);
  return null;
}

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

  await act(async () => {
    fireEvent.focus(rendered);
  });

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
