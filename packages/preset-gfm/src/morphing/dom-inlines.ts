import type { AetherInline } from "@aether-md/core";

export function appendInlineToDom(parent: HTMLElement, inline: AetherInline): void {
  if (inline.type === "text") {
    parent.append(document.createTextNode(inline.text));
    return;
  }

  if (inline.type === "mark" && inline.mark === "strong") {
    const element = document.createElement("strong");
    for (const child of inline.children) {
      appendInlineToDom(element, child);
    }
    parent.append(element);
    return;
  }

  if (inline.type === "mark" && inline.mark === "emphasis") {
    const element = document.createElement("em");
    for (const child of inline.children) {
      appendInlineToDom(element, child);
    }
    parent.append(element);
    return;
  }

  if (inline.type === "mark") {
    for (const child of inline.children) {
      appendInlineToDom(parent, child);
    }
    return;
  }

  if (inline.type === "link") {
    const element = document.createElement("a");
    element.href = inline.href;
    for (const child of inline.children) {
      appendInlineToDom(element, child);
    }
    parent.append(element);
  }
}
