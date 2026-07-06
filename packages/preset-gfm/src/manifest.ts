import type { ExtensionManifest, RuntimeManifest } from "@aether-md/core";

import { createGfmInteractiveRenderers } from "./morphing/registry.js";

/**
 * GFM preset manifest with Slice D `interactiveRenderers` for paragraph and list blocks.
 * Inline morphing serialize lives in `@aether-md/plugin-remark` helpers.
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
  runtime: {
    interactiveRenderers: createGfmInteractiveRenderers(),
  } as RuntimeManifest,
};
