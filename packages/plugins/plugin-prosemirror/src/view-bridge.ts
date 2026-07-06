import type { EngineSession, ReplaceTextCommand } from "@aether-md/core";
import { EditorView } from "prosemirror-view";
import { TextSelection } from "prosemirror-state";

import { pmBlockToAether } from "./conversion.js";
import { readSessionEditorState } from "./engine.js";

const proseMirrorViews = new WeakMap<HTMLElement, EditorView>();

/** Resolve mounted EditorView from a container or `.ProseMirror` root. */
export function resolveProseMirrorView(container: HTMLElement): EditorView | undefined {
  const root = container.classList.contains("ProseMirror")
    ? container
    : container.querySelector<HTMLElement>(".ProseMirror");
  return root ? proseMirrorViews.get(root) : undefined;
}

/** Find the document position at the start of the first match of `text`. */
export function findProseMirrorTextStart(view: EditorView, text: string): number {
  let position = -1;
  view.state.doc.descendants((node, pos) => {
    if (position >= 0) {
      return false;
    }
    if (node.isText && node.text?.includes(text)) {
      position = pos + node.text.indexOf(text);
      return false;
    }
    return undefined;
  });
  if (position < 0) {
    throw new Error(`Text not found in ProseMirror document: ${text}`);
  }
  return position;
}

/** Find the document position after the last match of `text` (for integration tests). */
export function findProseMirrorTextEnd(view: EditorView, text: string): number {
  let position = -1;
  view.state.doc.descendants((node, pos) => {
    if (position >= 0) {
      return false;
    }
    if (node.isText && node.text?.includes(text)) {
      position = pos + node.text.indexOf(text) + text.length;
      return false;
    }
    return undefined;
  });
  if (position < 0) {
    throw new Error(`Text not found in ProseMirror document: ${text}`);
  }
  return position;
}

/** Apply insertText at a document position (for integration tests). */
export function dispatchProseMirrorInsertText(
  view: EditorView,
  position: number,
  text: string,
): void {
  const tr = view.state.tr
    .setSelection(TextSelection.create(view.state.doc, position))
    .insertText(text);
  view.dispatch(tr);
}

export interface CreateProseMirrorViewOptions {
  session: EngineSession;
  dom: HTMLElement;
  dispatchInput?: (request: ReplaceTextCommand) => void;
}

export interface ProseMirrorViewHandle {
  view: EditorView;
  destroy: () => void;
}

function resolveDispatchInput(
  $from: import("prosemirror-state").Selection["$from"],
  doc: import("prosemirror-model").Node,
): Pick<ReplaceTextCommand, "children" | "text"> | null {
  const blockIndex = $from.index(0);
  const topBlock = doc.child(blockIndex);

  if (topBlock.type.name === "paragraph" || topBlock.type.name === "heading") {
    const aetherBlock = pmBlockToAether(topBlock);
    if (aetherBlock.type !== "paragraph" && aetherBlock.type !== "heading") {
      return null;
    }
    return { children: aetherBlock.children };
  }

  if (topBlock.type.name === "bullet_list" || topBlock.type.name === "ordered_list") {
    for (let depth = $from.depth; depth > 0; depth -= 1) {
      if ($from.node(depth).type.name !== "list_item") {
        continue;
      }

      const listItem = $from.node(depth);
      const paragraph = listItem.child(0);
      if (paragraph.type.name !== "paragraph") {
        return null;
      }

      const aetherParagraph = pmBlockToAether(paragraph);
      if (aetherParagraph.type !== "paragraph") {
        return null;
      }

      return {
        text: String($from.index(depth)),
        children: aetherParagraph.children,
      };
    }
  }

  return null;
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

        const request = resolveDispatchInput(transaction.selection.$from, transaction.doc);
        if (!request) {
          return;
        }

        dispatchInput({
          type: "replaceText",
          blockIndex: transaction.selection.$from.index(0),
          ...(request.children !== undefined ? { children: request.children } : {}),
          ...(request.text !== undefined ? { text: request.text } : {}),
        });
      },
    });
  }

  view = createView();
  const activeView = view;
  proseMirrorViews.set(activeView.dom, activeView);

  return {
    view: activeView,
    destroy() {
      if (destroyed) {
        return;
      }
      destroyed = true;
      proseMirrorViews.delete(activeView.dom);
      activeView.destroy();
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
