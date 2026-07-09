import type { AetherBlock, AetherDoc, AetherInline, AetherSchema } from "./model.js";
import type { AdapterError, SerializationError } from "../errors.js";

export interface EngineSession {
  readonly id: string;
}

export interface EngineSelectionSnapshot {
  readonly blockIndex: number;
  readonly anchorOffset: number;
  readonly headOffset: number;
}

export interface ReplaceTextCommand {
  type: "replaceText";
  blockIndex: number;
  text?: string;
  children?: AetherInline[];
  /** When set, replaces the entire block at `blockIndex` (whole-block edits, e.g. list block replacement). */
  replacement?: AetherBlock;
}

export interface MoveBlockCommand {
  type: "moveBlock";
  blockId: string;
  toIndex: number;
}

export interface SetDocumentCommand {
  type: "setDocument";
  doc: AetherDoc;
}

export type AdapterCommandRequest = ReplaceTextCommand | MoveBlockCommand | SetDocumentCommand;

export interface AdapterEvent {
  name: string;
  source: "adapter";
  payload?: unknown;
}

export interface AdapterTransactionResult {
  ok: boolean;
  doc?: AetherDoc;
  markdown?: string;
  events?: AdapterEvent[];
  error?: AdapterError;
}

export interface ParserAdapter {
  readonly name: string;
  parse(markdown: string, schema: AetherSchema): Promise<AetherDoc>;
}

export interface SerializerAdapter {
  readonly name: string;
  serialize(doc: AetherDoc, schema: AetherSchema): Promise<string>;
}

export interface EngineAdapter {
  readonly name: string;
  create(initialDoc: AetherDoc): Promise<EngineSession>;
  apply(session: EngineSession, request: AdapterCommandRequest): Promise<AdapterTransactionResult>;
  getDocument(session: EngineSession): AetherDoc;
  getSelection?(session: EngineSession): EngineSelectionSnapshot | null;
  dispose(session: EngineSession): Promise<void>;
}

export type { SerializationError };
