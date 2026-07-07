import type { AetherDoc, AetherSchema } from "../document/model.js";

export type WorkerRequestType = "parse" | "serialize";

export interface WorkerRequestEnvelope {
  readonly id: string;
  readonly type: WorkerRequestType;
  readonly payload: WorkerParsePayload | WorkerSerializePayload;
}

export interface WorkerParsePayload {
  readonly markdown: string;
  readonly schema: AetherSchema;
}

export interface WorkerSerializePayload {
  readonly doc: AetherDoc;
  readonly schema: AetherSchema;
}

export interface WorkerSuccessEnvelope<TValue> {
  readonly id: string;
  readonly ok: true;
  readonly value: TValue;
}

export interface WorkerFailureEnvelope {
  readonly id: string;
  readonly ok: false;
  readonly error: { readonly message: string };
}

export type WorkerResponseEnvelope<TValue> = WorkerSuccessEnvelope<TValue> | WorkerFailureEnvelope;

export interface WorkerParseResult {
  readonly doc: AetherDoc;
}

export interface WorkerSerializeResult {
  readonly markdown: string;
}

export function isWorkerResponseEnvelope(value: unknown): value is WorkerResponseEnvelope<unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.id === "string" && typeof record.ok === "boolean";
}
