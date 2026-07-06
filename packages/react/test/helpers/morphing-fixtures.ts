import assert from "node:assert/strict";
import React from "react";

import type { AetherEditor } from "@aether-md/core";

import { useAetherEditor } from "../../dist/use-aether-editor.js";

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
