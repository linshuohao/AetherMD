import type {
  AdapterCommandRequest,
  AdapterTransactionResult,
  AetherDoc,
  AetherInline,
  EngineAdapter,
  EngineSession,
} from "@aether-md/core";
import { AdapterError } from "@aether-md/core";
import { EditorState } from "prosemirror-state";

import { aetherDocToPm, pmToAetherDoc } from "./conversion.js";

interface SessionRecord {
  state: EditorState;
  disposed: boolean;
}

const sessions = new Map<string, SessionRecord>();

/** Internal read for view-bridge sync; not part of the public EngineAdapter contract. */
export function readSessionEditorState(session: EngineSession): EditorState {
  const record = sessions.get(session.id);
  if (!record || record.disposed) {
    throw new AdapterError({
      code: "APPLY_FAILED",
      message: "Invalid or disposed engine session",
    });
  }

  return record.state;
}

function replaceTextInDoc(
  doc: AetherDoc,
  blockIndex: number,
  inlineChildren: AetherInline[],
): AetherDoc {
  const children = doc.children.map((block, index) => {
    if (index !== blockIndex) {
      return block;
    }

    if (block.type === "paragraph" || block.type === "heading") {
      return {
        ...block,
        children: inlineChildren,
      };
    }

    return block;
  });

  return { type: "doc", children };
}

function resolveInlineChildren(request: Extract<AdapterCommandRequest, { type: "replaceText" }>): AetherInline[] {
  if (request.children !== undefined) {
    return request.children;
  }

  return [{ type: "text", text: request.text ?? "" }];
}

function canReplaceTextInBlock(doc: AetherDoc, blockIndex: number): boolean {
  const block = doc.children[blockIndex];
  return block?.type === "paragraph" || block?.type === "heading";
}

export function createProseMirrorEngineAdapter(): EngineAdapter {
  return {
    name: "prosemirror-engine",

    async create(initialDoc: AetherDoc): Promise<EngineSession> {
      try {
        const pmDoc = aetherDocToPm(initialDoc);
        const state = EditorState.create({ doc: pmDoc });
        const session: EngineSession = { id: crypto.randomUUID() };
        sessions.set(session.id, { state, disposed: false });
        return session;
      } catch (error) {
        throw new AdapterError({
          code: "CREATE_FAILED",
          message: "Failed to create engine session",
          cause: error,
        });
      }
    },

    async apply(
      session: EngineSession,
      request: AdapterCommandRequest,
    ): Promise<AdapterTransactionResult> {
      const record = sessions.get(session.id);

      if (!record) {
        return {
          ok: false,
          error: new AdapterError({
            code: "APPLY_FAILED",
            message: "Invalid engine session",
          }),
        };
      }

      if (record.disposed) {
        return {
          ok: false,
          error: new AdapterError({
            code: "APPLY_FAILED",
            message: "Engine session is disposed",
          }),
        };
      }

      const beforeDoc = pmToAetherDoc(record.state.doc);

      try {
        if (request.type === "replaceText") {
          if (request.blockIndex < 0 || request.blockIndex >= beforeDoc.children.length) {
            return {
              ok: false,
              error: new AdapterError({
                code: "APPLY_FAILED",
                message: `Invalid block index: ${request.blockIndex}`,
              }),
            };
          }

          if (!canReplaceTextInBlock(beforeDoc, request.blockIndex)) {
            return {
              ok: false,
              error: new AdapterError({
                code: "APPLY_FAILED",
                message: `replaceText does not support block type: ${beforeDoc.children[request.blockIndex]?.type}`,
              }),
            };
          }

          const updatedDoc = replaceTextInDoc(
            beforeDoc,
            request.blockIndex,
            resolveInlineChildren(request),
          );
          const pmDoc = aetherDocToPm(updatedDoc);
          record.state = EditorState.create({ doc: pmDoc });

          return {
            ok: true,
            doc: pmToAetherDoc(record.state.doc),
          };
        }

        return {
          ok: false,
          error: new AdapterError({
            code: "APPLY_FAILED",
            message: `Unsupported command type: ${(request as { type: string }).type}`,
          }),
        };
      } catch (error) {
        return {
          ok: false,
          error: new AdapterError({
            code: "APPLY_FAILED",
            message: "Apply failed",
            cause: error,
          }),
        };
      }
    },

    getDocument(session: EngineSession): AetherDoc {
      const record = sessions.get(session.id);
      if (!record || record.disposed) {
        return { type: "doc", children: [] };
      }

      return pmToAetherDoc(record.state.doc);
    },

    async dispose(session: EngineSession): Promise<void> {
      const record = sessions.get(session.id);
      if (!record) {
        return;
      }

      record.disposed = true;
      sessions.delete(session.id);
    },
  };
}
