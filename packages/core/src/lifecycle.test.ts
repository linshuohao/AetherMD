import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { bootstrapCore } from "./bootstrap.js";
import { runDestroyLifecycle } from "./lifecycle.js";
import { loadPluginManifests } from "./manifest.js";

describe("dispose lifecycle", () => {
  it("runs onDestroy in reverse successful lifecycle order", async () => {
    const calls: string[] = [];

    const runtime = await bootstrapCore([
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "table",
            dependsOn: ["heading"],
          },
          runtime: {
            onDestroy: () => {
              calls.push("table:destroy");
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
            onDestroy: () => {
              calls.push("heading:destroy");
            },
          },
        },
      },
    ]);

    await runtime.dispose();

    assert.deepEqual(calls, ["table:destroy", "heading:destroy"]);
  });

  it("only destroys plugins in the successful lifecycle order", async () => {
    const calls: string[] = [];
    const loaded = loadPluginManifests([
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "started",
          },
          runtime: {
            onDestroy: () => {
              calls.push("started:destroy");
            },
          },
        },
      },
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "not-started",
          },
          runtime: {
            onDestroy: () => {
              calls.push("not-started:destroy");
            },
          },
        },
      },
    ]);

    await runDestroyLifecycle([loaded[0]], {});

    assert.deepEqual(calls, ["started:destroy"]);
  });

  it("skips missing onDestroy hooks while preserving reverse order", async () => {
    const calls: string[] = [];

    const runtime = await bootstrapCore([
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "without-destroy",
          },
        },
      },
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "with-destroy",
          },
          runtime: {
            onDestroy: () => {
              calls.push("with-destroy");
            },
          },
        },
      },
    ]);

    await runtime.dispose();

    assert.deepEqual(calls, ["with-destroy"]);
  });

  it("does not run destroy hooks more than once for repeated dispose calls", async () => {
    let destroyCalls = 0;
    const runtime = await bootstrapCore([
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "tracked",
          },
          runtime: {
            onDestroy: () => {
              destroyCalls += 1;
            },
          },
        },
      },
    ]);

    await runtime.dispose();
    await runtime.dispose();

    assert.equal(destroyCalls, 1);
  });
});
