import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { validateServiceCapabilities } from "./capabilities.js";
import { CoreError } from "./errors.js";
import { loadPluginManifests } from "./manifest.js";

describe("validateServiceCapabilities", () => {
  it("accepts capabilities provided by the M1 Core set", () => {
    const loaded = loadPluginManifests([
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "history-consumer",
            requires: ["core:history"],
          },
        },
      },
    ]);

    const result = validateServiceCapabilities(loaded);

    assert.equal(result.provided.has("core:history"), true);
  });

  it("accepts capabilities provided by another loaded plugin", () => {
    const loaded = loadPluginManifests([
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "table-provider",
            provides: ["plugin:table"],
          },
        },
      },
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "table-consumer",
            requires: ["plugin:table"],
          },
        },
      },
    ]);

    assert.doesNotThrow(() => validateServiceCapabilities(loaded));
  });

  it("rejects missing capabilities as fatal Core errors before hooks run", () => {
    let onInitCalls = 0;
    const loaded = loadPluginManifests([
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "missing-consumer",
            requires: ["plugin:missing"],
          },
          runtime: {
            onInit: () => {
              onInitCalls += 1;
            },
          },
        },
      },
    ]);

    assert.throws(
      () => validateServiceCapabilities(loaded),
      (error: unknown) =>
        error instanceof CoreError &&
        error.code === "CAPABILITY_MISSING" &&
        error.severity === "fatal",
    );
    assert.equal(onInitCalls, 0);
  });

  it("does not silently provide engine or parser capabilities in M1", () => {
    const loaded = loadPluginManifests([
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "engine-consumer",
            requires: ["core:engine"],
          },
        },
      },
    ]);

    assert.throws(
      () => validateServiceCapabilities(loaded),
      (error: unknown) =>
        error instanceof CoreError && error.code === "CAPABILITY_MISSING",
    );
  });
});
