import type { AdapterCommandRequest, EngineSession } from "@aether-md/core";
import { EditorView } from "prosemirror-view";

import { pmBlockToAether } from "./conversion.js";
import { readSessionEditorState } from "./engine.js";

export interface CreateProseMirrorViewOptions {
  session: EngineSession;
  dom: HTMLElement;
  dispatchInput?: (request: AdapterCommandRequest) => void;
}

export interface ProseMirrorViewHandle {
  view: EditorView;
  destroy: () => void;
}

function extractReplaceTextRequest(
  blockIndex: number,
  request: Pick<AdapterCommandRequest, "children" | "text">,
): AdapterCommandRequest {
  return {
    type: "replaceText",
    blockIndex,
    ...(request.children !== undefined ? { children: request.children } : {}),
    ...(request.text !== undefined ? { text: request.text } : {}),
  };
}

export function createProseMirrorView(
  options: CreateProseMirrorViewOptions,
): ProseMirrorViewHandle {
  const { session, dom, dispatchInput } = options;
  let destroyed = false;
  let view: EditorView | undefined;

  function createView(): EditorView {
    const state = readSessionEditorState(session);
    return new EditorView(dom, {
      state,
      dispatchTransaction(transaction) {
        if (destroyed || !view) {
          return;
        }

        const nextState = view.state.apply(transaction);
        view.updateState(nextState);

        if (!dispatchInput || !transaction.docChanged) {
          return;
        }

        const blockIndex = transaction.selection.$from.index(0);
        const block = transaction.doc.child(blockIndex);
        if (block.type.name !== "paragraph" && block.type.name !== "heading") {
          return;
        }

        const aetherBlock = pmBlockToAether(block);
        if (aetherBlock.type !== "paragraph" && aetherBlock.type !== "heading") {
          return;
        }

        dispatchInput(
          extractReplaceTextRequest(blockIndex, {
            children: aetherBlock.children,
          }),
        );
      },
    });
  }

  view = createView();

  return {
    view,
    destroy() {
      if (destroyed) {
        return;
      }
      destroyed = true;
      view?.destroy();
      view = undefined;
    },
  };
}

export function refreshProseMirrorViewFromSession(
  handle: ProseMirrorViewHandle,
  session: EngineSession,
): void {
  const nextState = readSessionEditorState(session);
  handle.view.updateState(nextState);
}
