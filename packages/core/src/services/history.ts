import type { AetherDoc } from "../document/model.js";

export const CORE_UNDO_COMMAND = "core:undo" as const;
export const CORE_REDO_COMMAND = "core:redo" as const;

function cloneDoc(doc: AetherDoc): AetherDoc {
  return structuredClone(doc);
}

class HistoryStack {
  private readonly entries: AetherDoc[] = [];

  push(doc: AetherDoc): void {
    this.entries.push(cloneDoc(doc));
  }

  pop(): AetherDoc | undefined {
    const entry = this.entries.pop();
    return entry ? cloneDoc(entry) : undefined;
  }

  peek(): AetherDoc | undefined {
    const entry = this.entries.at(-1);
    return entry ? cloneDoc(entry) : undefined;
  }

  clear(): void {
    this.entries.length = 0;
  }

  get size(): number {
    return this.entries.length;
  }
}

export interface DocumentHistory {
  captureBefore(doc: AetherDoc): void;
  undo(current: AetherDoc): AetherDoc | null;
  redo(current: AetherDoc): AetherDoc | null;
  canUndo(): boolean;
  canRedo(): boolean;
  clear(): void;
}

export function createDocumentHistory(): DocumentHistory {
  const undoStack = new HistoryStack();
  const redoStack = new HistoryStack();

  return {
    captureBefore(doc: AetherDoc) {
      undoStack.push(doc);
      redoStack.clear();
    },

    undo(current: AetherDoc) {
      const previous = undoStack.pop();
      if (!previous) {
        return null;
      }
      redoStack.push(current);
      return previous;
    },

    redo(current: AetherDoc) {
      const next = redoStack.pop();
      if (!next) {
        return null;
      }
      undoStack.push(current);
      return next;
    },

    canUndo() {
      return undoStack.size > 0;
    },

    canRedo() {
      return redoStack.size > 0;
    },

    clear() {
      undoStack.clear();
      redoStack.clear();
    },
  };
}

/** HistoryService surface on EditorContext. Undo/redo via `core:undo` / `core:redo` on the editor. */
export interface HistoryService {
  canUndo(): boolean;
  canRedo(): boolean;
}

export function createHistoryService(history: DocumentHistory): HistoryService {
  return {
    canUndo: () => history.canUndo(),
    canRedo: () => history.canRedo(),
  };
}
