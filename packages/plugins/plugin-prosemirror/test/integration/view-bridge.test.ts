import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { TextSelection } from "prosemirror-state";

import type { AdapterCommandRequest, AetherDoc } from "@aether-md/core";

import { createProseMirrorEngineAdapter } from "../../dist/engine.js";
import {
  createProseMirrorView,
  dispatchProseMirrorInsertText,
  findProseMirrorTextEnd,
  refreshProseMirrorViewFromSession,
} from "../../dist/view-bridge.js";

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

  it("does not dispatch input for selection-only transactions", async () => {
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

    handle.view.dispatch(
      handle.view.state.tr.setSelection(TextSelection.create(handle.view.state.doc, 3)),
    );

    assert.equal(dispatchCount, 0);

    handle.destroy();
    dom.remove();
  });

  it("dispatches structured inline children for edited blocks", async () => {
    const session = await engine.create({
      type: "doc",
      children: [
        {
          type: "paragraph",
          children: [
            { type: "text", text: "Hello " },
            {
              type: "mark",
              mark: "strong",
              children: [{ type: "text", text: "AetherMD" }],
            },
          ],
        },
      ],
    });
    const dom = document.createElement("div");
    document.body.appendChild(dom);

    let capturedRequest: AdapterCommandRequest | null = null;
    const handle = createProseMirrorView({
      session,
      dom,
      dispatchInput(request) {
        capturedRequest = request;
      },
    });

    handle.view.dispatch(handle.view.state.tr.insertText("!", handle.view.state.selection.from));

    assert.ok(capturedRequest);
    const request = capturedRequest as AdapterCommandRequest;
    assert.equal(request.type, "replaceText");
    assert.equal(request.blockIndex, 0);
    assert.ok(request.children);
    assert.match(JSON.stringify(request.children), /strong/);

    handle.destroy();
    dom.remove();
  });

  it("dispatches list item paragraph children with list item index in text", async () => {
    const session = await engine.create({
      type: "doc",
      children: [
        {
          type: "list",
          ordered: false,
          items: [
            [
              {
                type: "paragraph",
                children: [{ type: "text", text: "item one" }],
              },
            ],
          ],
        },
      ],
    });
    const dom = document.createElement("div");
    document.body.appendChild(dom);

    let capturedRequest: AdapterCommandRequest | null = null;
    const handle = createProseMirrorView({
      session,
      dom,
      dispatchInput(request) {
        capturedRequest = request;
      },
    });

    const endPos = findProseMirrorTextEnd(handle.view, "item one");
    dispatchProseMirrorInsertText(handle.view, endPos, " updated");

    assert.ok(capturedRequest);
    const request = capturedRequest as AdapterCommandRequest;
    assert.equal(request.type, "replaceText");
    assert.equal(request.blockIndex, 0);
    assert.equal(request.text, "0");
    assert.ok(request.children);
    assert.match(JSON.stringify(request.children), /item one updated/);

    handle.destroy();
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
    handle.view.dispatch(handle.view.state.tr.insertText("!", handle.view.state.selection.from));

    assert.equal(dispatchCount, 1);
    assert.deepEqual(engine.getDocument(session), before);

    handle.destroy();
    dom.remove();
  });
});
