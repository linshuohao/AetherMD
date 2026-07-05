import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { bootstrapCore } from "./bootstrap.js";
import { CoreError } from "./errors.js";

describe("bootstrapCore startup lifecycle", () => {
  it("does not run lifecycle hooks when validation fails", async () => {
    let onInitCalls = 0;
    let onReadyCalls = 0;

    await assert.rejects(() =>
      bootstrapCore([
        {
          manifest: {
            metadata: {
              manifestVersion: 1,
              name: "consumer",
              requires: ["plugin:missing"],
            },
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

  it("runs onInit and onReady in dependency order", async () => {
    const calls: string[] = [];

    await bootstrapCore([
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "table",
            dependsOn: ["heading"],
          },
          runtime: {
            onInit: () => {
              calls.push("table:init");
            },
            onReady: () => {
              calls.push("table:ready");
            },
          },
        },
      },
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "heading",
          },
          runtime: {
            onInit: () => {
              calls.push("heading:init");
            },
            onReady: () => {
              calls.push("heading:ready");
            },
          },
        },
      },
    ]);

    assert.deepEqual(calls, [
      "heading:init",
      "table:init",
      "heading:ready",
      "table:ready",
    ]);
  });

  it("awaits async onInit before running onReady", async () => {
    const calls: string[] = [];

    await bootstrapCore([
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "async-plugin",
          },
          runtime: {
            onInit: async () => {
              await Promise.resolve();
              calls.push("init");
            },
            onReady: () => {
              calls.push("ready");
            },
          },
        },
      },
    ]);

    assert.deepEqual(calls, ["init", "ready"]);
  });

  it("skips missing hooks without changing other hook order", async () => {
    const calls: string[] = [];

    await bootstrapCore([
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "without-hooks",
          },
        },
      },
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "with-hooks",
          },
          runtime: {
            onInit: () => {
              calls.push("with-hooks:init");
            },
            onReady: () => {
              calls.push("with-hooks:ready");
            },
          },
        },
      },
    ]);

    assert.deepEqual(calls, ["with-hooks:init", "with-hooks:ready"]);
  });
});

describe("bootstrapCore duplicate metadata.name validation", () => {
  it("rejects duplicate metadata.name before lifecycle hooks", async () => {
    let onInitCalls = 0;
    let onReadyCalls = 0;
    let onDestroyCalls = 0;

    await assert.rejects(
      async () =>
        bootstrapCore([
          {
            manifest: {
              metadata: {
                manifestVersion: 1,
                name: "dup",
              },
              runtime: {
                onInit: () => {
                  onInitCalls += 1;
                },
                onReady: () => {
                  onReadyCalls += 1;
                },
                onDestroy: () => {
                  onDestroyCalls += 1;
                },
              },
            },
          },
          {
            manifest: {
              metadata: {
                manifestVersion: 1,
                name: "dup",
              },
              runtime: {
                onInit: () => {
                  onInitCalls += 1;
                },
                onReady: () => {
                  onReadyCalls += 1;
                },
                onDestroy: () => {
                  onDestroyCalls += 1;
                },
              },
            },
          },
        ]),
      (error: unknown) => {
        assert.ok(error instanceof CoreError);
        assert.equal(error.code, "PLUGIN_NAME_DUPLICATE");
        return true;
      },
    );

    assert.equal(onInitCalls, 0);
    assert.equal(onReadyCalls, 0);
    assert.equal(onDestroyCalls, 0);
  });

  it("allows unique plugin names to bootstrap", async () => {
    const runtime = await bootstrapCore([
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "alpha",
          },
        },
      },
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "beta",
          },
        },
      },
    ]);

    assert.equal(runtime.orderedPlugins.length, 2);
    await runtime.dispose();
  });
});
