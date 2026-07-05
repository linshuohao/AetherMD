import type { ExtensionManifest } from "@aether-md/core";

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
