import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";

import { useAetherEditor } from "./use-aether-editor.js";

describe("useAetherEditor", () => {
  it("throws when rendered outside AetherEditorRoot provider", () => {
    const Probe = defineComponent({
      setup() {
        useAetherEditor();
        return () => null;
      },
    });

    assert.throws(() => {
      mount(Probe);
    }, /must be used within AetherEditorRoot/);
  });
});
