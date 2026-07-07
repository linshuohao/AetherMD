import type { TelemetrySpan } from "./types.js";

export function createNoopTelemetrySpan(name: string): TelemetrySpan {
  return {
    name,
    setAttribute() {},
    end() {},
  };
}
