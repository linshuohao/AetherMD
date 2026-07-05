import type { AdapterCommandRequest, EngineSession } from "@aether-md/core";
import { EditorView } from "prosemirror-view";

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
  session: EngineSession,
  blockIndex: number,
  text: string,
): AdapterCommandRequest {
  return {
    type: "replaceText",
    blockIndex,
    text,
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

        if (dispatchInput) {
          const nextState = view.state.apply(transaction);
          view.updateState(nextState);

          for (let index = 0; index < transaction.doc.childCount; index += 1) {
            const block = transaction.doc.child(index);
            if (block.type.name === "paragraph" || block.type.name === "heading") {
              dispatchInput(
                extractReplaceTextRequest(session, index, block.textContent),
              );
              return;
            }
          }
          return;
        }

        const nextState = view.state.apply(transaction);
        view.updateState(nextState);
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
