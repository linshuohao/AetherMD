import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { createClipboardService } from "./clipboard.js";
import { CoreError } from "../errors.js";

const grantedClipboard = new Set(["perm:clipboard"] as const);

describe("createClipboardService", () => {
  it("stores and reads copied text when perm:clipboard is granted", () => {
    const clipboard = createClipboardService({ grantedPermissions: grantedClipboard });
    clipboard.copy("hello");
    assert.equal(clipboard.read(), "hello");
    assert.equal(clipboard.paste(), "hello");
  });

  it("clears buffer when perm:clipboard is granted", () => {
    const clipboard = createClipboardService({ grantedPermissions: grantedClipboard });
    clipboard.copy("x");
    clipboard.clear();
    assert.equal(clipboard.read(), "");
  });

  it("rejects operations without perm:clipboard", () => {
    const clipboard = createClipboardService({ grantedPermissions: new Set() });
    assert.throws(
      () => clipboard.copy("hello"),
      (error: unknown) => error instanceof CoreError && error.code === "PERMISSION_DENIED",
    );
  });
});
