import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { bootstrapCore } from "./bootstrap.js";
import { CoreError } from "../errors.js";
import { runDestroyLifecycle } from "./lifecycle.js";
import { loadPluginManifests } from "../manifest/manifest.js";

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
    await assert.doesNotReject(async () => runtime.dispose());
    await assert.doesNotReject(async () => runtime.dispose());

    assert.equal(destroyCalls, 1);
  });

  it("aborts normal dispose when onDestroy fails", async () => {
    const destroyCalls: string[] = [];

    const runtime = await bootstrapCore([
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "heading",
          },
          runtime: {
            onDestroy: () => {
              destroyCalls.push("heading:destroy");
            },
          },
        },
      },
      {
        manifest: {
          metadata: {
            manifestVersion: 1,
            name: "table",
            dependsOn: ["heading"],
          },
          runtime: {
            onDestroy: () => {
              destroyCalls.push("table:destroy");
              throw new Error("destroy failed");
            },
          },
        },
      },
    ]);

    await assert.rejects(
      async () => runtime.dispose(),
      (error: unknown) => {
        assert.ok(error instanceof CoreError);
        assert.equal(error.code, "LIFECYCLE_HOOK_FAILED");
        assert.equal(error.pluginName, "table");
        return true;
      },
    );

    assert.deepEqual(destroyCalls, ["table:destroy"]);
  });
});

describe("bootstrapCore startup failure cleanup", () => {
  it("cleans up successful onInit plugins when a later onInit fails", async () => {
    const destroyCalls: string[] = [];

    await assert.rejects(
      async () =>
        bootstrapCore([
          {
            manifest: {
              metadata: {
                manifestVersion: 1,
                name: "first",
              },
              runtime: {
                onInit: () => {},
                onDestroy: () => {
                  destroyCalls.push("first:destroy");
                },
              },
            },
          },
          {
            manifest: {
              metadata: {
                manifestVersion: 1,
                name: "second",
              },
              runtime: {
                onInit: () => {
                  throw new Error("onInit failed");
                },
                onDestroy: () => {
                  destroyCalls.push("second:destroy");
                },
              },
            },
          },
        ]),
      (error: unknown) => {
        assert.ok(error instanceof CoreError);
        assert.equal(error.code, "LIFECYCLE_HOOK_FAILED");
        assert.equal(error.pluginName, "second");
        return true;
      },
    );

    assert.deepEqual(destroyCalls, ["first:destroy"]);
  });

  it("cleans up all onInit-success plugins when onReady fails", async () => {
    const destroyCalls: string[] = [];

    await assert.rejects(
      async () =>
        bootstrapCore([
          {
            manifest: {
              metadata: {
                manifestVersion: 1,
                name: "alpha",
              },
              runtime: {
                onInit: () => {},
                onReady: () => {},
                onDestroy: () => {
                  destroyCalls.push("alpha:destroy");
                },
              },
            },
          },
          {
            manifest: {
              metadata: {
                manifestVersion: 1,
                name: "beta",
              },
              runtime: {
                onInit: () => {},
                onReady: () => {
                  throw new Error("onReady failed");
                },
                onDestroy: () => {
                  destroyCalls.push("beta:destroy");
                },
              },
            },
          },
        ]),
      (error: unknown) => {
        assert.ok(error instanceof CoreError);
        assert.equal(error.code, "LIFECYCLE_HOOK_FAILED");
        assert.equal(error.pluginName, "beta");
        return true;
      },
    );

    assert.deepEqual(destroyCalls, ["beta:destroy", "alpha:destroy"]);
  });

  it("does not invoke onDestroy when startup fails before any successful onInit", async () => {
    const destroyCalls: string[] = [];

    await assert.rejects(
      async () =>
        bootstrapCore([
          {
            manifest: {
              metadata: {
                manifestVersion: 1,
                name: "failing",
              },
              runtime: {
                onInit: () => {
                  throw new Error("first onInit failed");
                },
                onDestroy: () => {
                  destroyCalls.push("failing:destroy");
                },
              },
            },
          },
        ]),
      (error: unknown) => {
        assert.ok(error instanceof CoreError);
        assert.equal(error.code, "LIFECYCLE_HOOK_FAILED");
        return true;
      },
    );

    assert.deepEqual(destroyCalls, []);
  });

  it("continues startup cleanup when onDestroy fails during cleanup", async () => {
    const destroyCalls: string[] = [];

    await assert.rejects(
      async () =>
        bootstrapCore([
          {
            manifest: {
              metadata: {
                manifestVersion: 1,
                name: "first",
              },
              runtime: {
                onInit: () => {},
                onDestroy: () => {
                  destroyCalls.push("first:destroy");
                  throw new Error("destroy failed");
                },
              },
            },
          },
          {
            manifest: {
              metadata: {
                manifestVersion: 1,
                name: "middle",
              },
              runtime: {
                onInit: () => {},
                onDestroy: () => {
                  destroyCalls.push("middle:destroy");
                },
              },
            },
          },
          {
            manifest: {
              metadata: {
                manifestVersion: 1,
                name: "last",
              },
              runtime: {
                onInit: () => {
                  throw new Error("onInit failed");
                },
                onDestroy: () => {
                  destroyCalls.push("last:destroy");
                },
              },
            },
          },
        ]),
      (error: unknown) => {
        assert.ok(error instanceof CoreError);
        assert.equal(error.code, "LIFECYCLE_HOOK_FAILED");
        assert.equal(error.pluginName, "last");
        return true;
      },
    );

    assert.deepEqual(destroyCalls, ["middle:destroy", "first:destroy"]);
  });

  it("does not return a running bootstrap runtime when startup hook fails", async () => {
    await assert.rejects(
      async () =>
        bootstrapCore([
          {
            manifest: {
              metadata: {
                manifestVersion: 1,
                name: "failing",
              },
              runtime: {
                onInit: () => {
                  throw new Error("startup failed");
                },
              },
            },
          },
        ]),
      (error: unknown) => {
        assert.ok(error instanceof CoreError);
        return true;
      },
    );
  });
});
