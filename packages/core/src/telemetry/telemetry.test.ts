import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { createNoopTelemetryService } from "./noop.js";
import { createNoopTelemetrySpan } from "./span.js";
import type { TelemetryEvent, TelemetryService } from "./types.js";

describe("createNoopTelemetryService", () => {
  it("does not throw on track or startSpan", () => {
    const telemetry = createNoopTelemetryService();
    assert.doesNotThrow(() => {
      telemetry.track({ name: "editor.ready" });
      const span = telemetry.startSpan("command.dispatch", { commandId: "core:replaceText" });
      span.setAttribute("ok", true);
      span.end();
    });
  });
});

describe("host telemetry injection", () => {
  it("forwards track events to the host sink", () => {
    const events: TelemetryEvent[] = [];
    const hostTelemetry: TelemetryService = {
      track(event) {
        events.push(event);
      },
      startSpan(name, _attributes) {
        return createNoopTelemetrySpan(name);
      },
    };

    hostTelemetry.track({
      name: "command.executed",
      timestamp: 1,
      attributes: { commandId: "core:replaceText", ok: true },
    });

    assert.equal(events.length, 1);
    assert.equal(events[0]?.name, "command.executed");
    assert.equal(events[0]?.attributes?.commandId, "core:replaceText");
  });
});
