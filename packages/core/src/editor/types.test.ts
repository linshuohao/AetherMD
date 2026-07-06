import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { EditorStateSnapshot } from "../editor/types.js";

describe("Editor public types", () => {
  it("EditorStateSnapshot exposes doc and readOnly without store API", () => {
    const snapshot: EditorStateSnapshot = {
      doc: {
        type: "doc",
        children: [{ type: "paragraph", children: [{ type: "text", text: "x" }] }],
      },
      readOnly: false,
    };

    assert.equal(snapshot.readOnly, false);
    assert.equal("subscribe" in snapshot, false);
    assert.equal("store" in snapshot, false);
  });
});
