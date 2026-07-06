import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";

import type { AetherDoc, AetherEditor, EventListener, Unsubscribe } from "@aether-md/core";

import { AetherEditorContext } from "./context.js";
import { useAetherEditor } from "./use-aether-editor.js";

GlobalRegistrator.register();

function createMockEditor(options: {
  markdown?: string;
  doc?: AetherDoc;
}): AetherEditor & { emitChange: (markdown: string, doc: AetherDoc) => void } {
  const listeners = new Map<string, Set<EventListener>>();
  let markdown = options.markdown ?? "";
  let doc: AetherDoc = options.doc ?? {
    type: "doc",
    children: [{ type: "paragraph", children: [{ type: "text", text: "" }] }],
  };

  return {
    context: {} as AetherEditor["context"],
    state: { doc, readOnly: false },
    dispatch: async () => ({ ok: true }),
    on(eventName, listener) {
      const set = listeners.get(eventName) ?? new Set();
      set.add(listener);
      listeners.set(eventName, set);
      return (() => {
        set.delete(listener);
      }) satisfies Unsubscribe;
    },
    getMarkdown: async () => markdown,
    getDocument: () => doc,
    dispose: async () => {},
    emitChange(nextMarkdown: string, nextDoc: AetherDoc) {
      markdown = nextMarkdown;
      doc = nextDoc;
      for (const listener of listeners.get("change") ?? []) {
        listener({
          name: "change",
          source: "core",
          timestamp: Date.now(),
          payload: { doc: nextDoc },
        });
      }
    },
  };
}

describe("useAetherEditor", () => {
  it("throws when rendered outside AetherEditorRoot provider", () => {
    assert.throws(() => {
      renderHook(() => useAetherEditor());
    }, /must be used within AetherEditorRoot/);
  });

  it("bridges change events to markdown and doc state", async () => {
    const editor = createMockEditor({
      markdown: "Hello",
      doc: {
        type: "doc",
        children: [{ type: "paragraph", children: [{ type: "text", text: "Hello" }] }],
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        AetherEditorContext.Provider,
        {
          value: {
            editor,
            markdown: "Hello",
            doc: editor.getDocument(),
            ready: true,
            error: null,
          },
        },
        children,
      );

    const { result } = renderHook(() => useAetherEditor(), { wrapper });

    const updatedDoc: AetherDoc = {
      type: "doc",
      children: [{ type: "paragraph", children: [{ type: "text", text: "Updated" }] }],
    };

    editor.emitChange("Updated", updatedDoc);

    await waitFor(() => {
      assert.equal(result.current.markdown, "Updated");
      assert.deepEqual(result.current.doc, updatedDoc);
    });
  });
});
