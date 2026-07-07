/** Structured telemetry event emitted by core operations. */
export interface TelemetryEvent {
  readonly name: string;
  readonly timestamp?: number;
  readonly durationMs?: number;
  readonly attributes?: Readonly<Record<string, unknown>>;
}

/**
 * OTel-compatible span surface (stub; no `@opentelemetry/api` dependency).
 * Hosts MAY map this to real OTel spans via `EditorConfig.telemetry`.
 */
export interface TelemetrySpan {
  readonly name: string;
  setAttribute(key: string, value: unknown): void;
  end(endTime?: number): void;
}

export interface TelemetryService {
  track(event: TelemetryEvent): void;
  startSpan(name: string, attributes?: Readonly<Record<string, unknown>>): TelemetrySpan;
}
