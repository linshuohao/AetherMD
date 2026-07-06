import type { ExtensionManifest } from "@aether-md/core";

/**
 * GFM preset manifest. `interactiveRenderers` (see `docs/sdk/manifest.md`) is
 * reserved for Slice D block-level DOM morphing render registration; inline
 * morphing serialize lives in `gfm-inline-morphing.ts` (headless, no React).
 */
export const gfmManifest: ExtensionManifest = {
  metadata: {
    manifestVersion: 1,
    name: "gfm",
    version: "0.0.0",
    provides: ["core:parser", "core:serializer", "core:engine"],
    requires: ["core:bootstrap"],
    dependsOn: ["remark", "prosemirror"],
  },
};
