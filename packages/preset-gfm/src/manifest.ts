/**
 * GFM preset manifest metadata.
 *
 * Block-level DOM morphing renderers for `paragraph` and `list` are registered on
 * the wired preset plugin via `morphingStrategies` and `morphingRegistry`
 * (`createGfmPreset()`), not on `manifest.runtime`. See `docs/sdk/manifest.md`.
 *
 * Inline morphing serialize lives in `@aether-md/plugin-remark` helpers.
 *
 * Adapter implementations are bundled from `@aether-md/plugin-remark` and
 * `@aether-md/plugin-prosemirror` inside `createGfmPreset()` — no separate runtime plugins.
 */
import { type ExtensionManifest } from "@aether-md/core/plugin";
export const gfmManifest: ExtensionManifest = {
  metadata: {
    manifestVersion: 1,
    name: "gfm",
    version: "0.0.0",
    provides: ["core:parser", "core:serializer", "core:engine"],
    requires: ["core:bootstrap"],
  },
};
