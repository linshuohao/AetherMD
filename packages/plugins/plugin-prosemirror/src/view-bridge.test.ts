import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

import type { AetherDoc } from "@aether-md/core";

import { createProseMirrorEngineAdapter } from "./engine.js";
import {
  createProseMirrorView,
  refreshProseMirrorViewFromSession,
} from "./view-bridge.js";

GlobalRegistrator.register();

function paragraphDoc(text: string): AetherDoc {
  return {
    type: "doc",
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", text }],
      },
    ],
  };
}

describe("createProseMirrorView", () => {
  const engine = createProseMirrorEngineAdapter();

  it("creates a view mounted on the provided DOM element", async () => {
    const session = await engine.create(paragraphDoc("Hello"));
    const dom = document.createElement("div");
    document.body.appendChild(dom);

    const handle = createProseMirrorView({ session, dom });

    assert.ok(handle.view.dom.isConnected);
    handle.destroy();
    dom.remove();
  });

  it("keeps view document aligned with getDocument after apply", async () => {
    const session = await engine.create(paragraphDoc("Hello"));
    const dom = document.createElement("div");
    document.body.appendChild(dom);

    const handle = createProseMirrorView({ session, dom });

    await engine.apply(session, {
      type: "replaceText",
      blockIndex: 0,
      text: "Updated",
    });
    refreshProseMirrorViewFromSession(handle, session);

    const snapshot = engine.getDocument(session);
    assert.equal(snapshot.children[0]?.type, "paragraph");
    assert.equal(handle.view.state.doc.textContent, "Updated");

    handle.destroy();
    dom.remove();
  });

  it("allows destroy to be called repeatedly without throwing", async () => {
    const session = await engine.create(paragraphDoc("Hello"));
    const dom = document.createElement("div");
    document.body.appendChild(dom);

    const handle = createProseMirrorView({ session, dom });
    handle.destroy();
    assert.doesNotThrow(() => handle.destroy());

    dom.remove();
  });

  it("does not mutate session document when dispatchInput is invoked", async () => {
    const session = await engine.create(paragraphDoc("Hello"));
    const dom = document.createElement("div");
    document.body.appendChild(dom);

    let dispatchCount = 0;
    const handle = createProseMirrorView({
      session,
      dom,
      dispatchInput() {
        dispatchCount += 1;
      },
    });

    const before = engine.getDocument(session);
    handle.view.dispatch(
      handle.view.state.tr.insertText("!", handle.view.state.selection.from),
    );

    assert.equal(dispatchCount, 1);
    assert.deepEqual(engine.getDocument(session), before);

    handle.destroy();
    dom.remove();
  });
});
