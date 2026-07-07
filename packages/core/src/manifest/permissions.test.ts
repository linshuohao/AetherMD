import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { loadPluginManifests } from "./manifest.js";
import {
  collectPluginPermissionRequests,
  DEFAULT_HOST_GRANTED_PERMISSIONS,
  resolveEffectivePermissions,
} from "./permissions.js";

describe("resolveEffectivePermissions", () => {
  it("uses host defaults when plugins declare no security.requests", () => {
    const loaded = loadPluginManifests([
      {
        manifest: {
          metadata: { manifestVersion: 1, name: "official-preset" },
        },
      },
    ]);

    const effective = resolveEffectivePermissions({ loadedPlugins: loaded });

    for (const permission of DEFAULT_HOST_GRANTED_PERMISSIONS) {
      assert.equal(effective.has(permission), true);
    }
    assert.equal(effective.has("perm:network"), false);
  });

  it("intersects plugin requests with host grants", () => {
    const loaded = loadPluginManifests([
      {
        manifest: {
          metadata: { manifestVersion: 1, name: "network-plugin" },
          security: { requests: ["perm:network", "perm:dom"] },
        },
      },
    ]);

    const effective = resolveEffectivePermissions({
      loadedPlugins: loaded,
      hostGranted: ["perm:dom", "perm:clipboard"],
    });

    assert.equal(effective.has("perm:dom"), true);
    assert.equal(effective.has("perm:network"), false);
    assert.equal(effective.has("perm:clipboard"), false);
  });

  it("collects union of plugin permission requests", () => {
    const loaded = loadPluginManifests([
      {
        manifest: {
          metadata: { manifestVersion: 1, name: "a" },
          security: { requests: ["perm:clipboard"] },
        },
      },
      {
        manifest: {
          metadata: { manifestVersion: 1, name: "b" },
          security: { requests: ["perm:dom"] },
        },
      },
    ]);

    const requested = collectPluginPermissionRequests(loaded);
    assert.equal(requested.has("perm:clipboard"), true);
    assert.equal(requested.has("perm:dom"), true);
  });
});
