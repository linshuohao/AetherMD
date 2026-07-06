import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CoreError } from "../../dist/errors.js";
import { loadPluginManifests } from "../../dist/manifest.js";

describe("loadPluginManifests", () => {
  it("accepts supported manifest version 1", () => {
    const loaded = loadPluginManifests([
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "heading",
          },
        },
      },
    ]);

    assert.equal(loaded[0]?.manifest.metadata.name, "heading");
  });

  it("rejects unsupported manifest versions as fatal Core errors", () => {
    assert.throws(
      () =>
        loadPluginManifests([
          {
            manifest: {
              metadata: {
                manifestVersion: 2,
                name: "heading",
              },
            },
          },
        ]),
      (error: unknown) =>
        error instanceof CoreError &&
        error.code === "MANIFEST_VERSION_UNSUPPORTED" &&
        error.severity === "fatal",
    );
  });

  it("rejects missing manifest.metadata as fatal Core errors", () => {
    assert.throws(
      () =>
        loadPluginManifests([
          {
            manifest: {},
          },
        ]),
      (error: unknown) =>
        error instanceof CoreError &&
        error.code === "MANIFEST_INVALID" &&
        error.severity === "fatal",
    );
  });

  it("does not call lifecycle hooks while validating manifest shape", () => {
    let onInitCalls = 0;
    let onReadyCalls = 0;

    assert.throws(() =>
      loadPluginManifests([
        {
          manifest: {
            runtime: {
              onInit: () => {
                onInitCalls += 1;
              },
              onReady: () => {
                onReadyCalls += 1;
              },
            },
          },
        },
      ]),
    );

    assert.equal(onInitCalls, 0);
    assert.equal(onReadyCalls, 0);
  });
});
