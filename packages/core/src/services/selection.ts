import type {
  EngineAdapter,
  EngineSelectionSnapshot,
  EngineSession,
} from "../document/adapter-types.js";

export type EditorSelection = EngineSelectionSnapshot;

export interface SelectionCapableEngine extends EngineAdapter {
  getSelection(session: EngineSession): EditorSelection | null;
}

export function isSelectionCapableEngine(
  adapter: EngineAdapter,
): adapter is SelectionCapableEngine {
  return typeof adapter.getSelection === "function";
}

export interface SelectionService {
  getSelection(): EditorSelection | null;
}

export function createSelectionService(
  engine: EngineAdapter,
  session: EngineSession,
): SelectionService {
  return {
    getSelection() {
      if (!isSelectionCapableEngine(engine)) {
        return null;
      }
      return engine.getSelection(session);
    },
  };
}
