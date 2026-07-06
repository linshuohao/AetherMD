import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { resolvePluginDependencyOrder } from "./manifest/dependencies.js";
import { CoreError } from "./errors.js";
import { loadPluginManifests } from "./manifest/manifest.js";

describe("resolvePluginDependencyOrder", () => {
  it("orders dependencies before dependent plugins", () => {
    const loaded = loadPluginManifests([
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "table",
            dependsOn: ["heading"],
          },
        },
      },
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "heading",
          },
        },
      },
    ]);

    const ordered = resolvePluginDependencyOrder(loaded);

    assert.deepEqual(
      ordered.map((plugin) => plugin.manifest.metadata.name),
      ["heading", "table"],
    );
  });

  it("preserves host input order for plugins at the same dependency level", () => {
    const loaded = loadPluginManifests([
      { manifest: { metadata: { manifestVersion: 1, name: "first" } } },
      { manifest: { metadata: { manifestVersion: 1, name: "second" } } },
      { manifest: { metadata: { manifestVersion: 1, name: "third" } } },
    ]);

    const ordered = resolvePluginDependencyOrder(loaded);

    assert.deepEqual(
      ordered.map((plugin) => plugin.manifest.metadata.name),
      ["first", "second", "third"],
    );
  });

  it("rejects missing dependencies as fatal Core errors before hooks run", () => {
    let onInitCalls = 0;
    const loaded = loadPluginManifests([
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "table",
            dependsOn: ["heading"],
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
      () => resolvePluginDependencyOrder(loaded),
      (error: unknown) =>
        error instanceof CoreError &&
        error.code === "PLUGIN_DEPENDENCY_MISSING" &&
        error.severity === "fatal",
    );
    assert.equal(onInitCalls, 0);
  });

  it("rejects dependency cycles as fatal Core errors before hooks run", () => {
    let onInitCalls = 0;
    const loaded = loadPluginManifests([
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "a",
            dependsOn: ["b"],
          },
          runtime: {
            onInit: () => {
              onInitCalls += 1;
            },
          },
        },
      },
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "b",
            dependsOn: ["a"],
          },
        },
      },
    ]);

    assert.throws(
      () => resolvePluginDependencyOrder(loaded),
      (error: unknown) =>
        error instanceof CoreError &&
        error.code === "PLUGIN_DEPENDENCY_CYCLE" &&
        error.severity === "fatal",
    );
    assert.equal(onInitCalls, 0);
  });
});
