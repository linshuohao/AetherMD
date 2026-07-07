import { createNoopTelemetrySpan } from "./span.js";
import type { TelemetryEvent, TelemetryService } from "./types.js";

export function createNoopTelemetryService(): TelemetryService {
  return {
    track(_event: TelemetryEvent) {},
    startSpan(name) {
      return createNoopTelemetrySpan(name);
    },
  };
}
