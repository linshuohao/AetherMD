import { createElement, type ReactNode } from "react";

import type { AetherInline, ParagraphBlock } from "@aether-md/core";
import { paragraphSourceFromBlock } from "@aether-md/preset-gfm";

export { paragraphSourceFromBlock };

/** @deprecated Use paragraphSourceFromBlock with doc block for multi-block docs. */
export function paragraphSourceFromMarkdown(markdown: string): string {
  return markdown.replace(/\n+$/, "");
}

function renderInline(inline: AetherInline, key: number): ReactNode {
  if (inline.type === "text") {
    return inline.text;
  }

  if (inline.type === "mark" && inline.mark === "strong") {
    return createElement(
      "strong",
      { key },
      inline.children.map((child, index) => renderInline(child, index)),
    );
  }

  if (inline.type === "mark" && inline.mark === "emphasis") {
    return createElement(
      "em",
      { key },
      inline.children.map((child, index) => renderInline(child, index)),
    );
  }

  if (inline.type === "mark") {
    return inline.children.map((child, index) => renderInline(child, index));
  }

  if (inline.type === "link") {
    return createElement(
      "a",
      { key, href: inline.href },
      inline.children.map((child, index) => renderInline(child, index)),
    );
  }

  return null;
}

/** @deprecated Slice D uses preset interactiveRenderers via RenderedBlockHost. */
export function renderParagraphFromBlock(block: ParagraphBlock): ReactNode {
  const parts = block.children.map((inline, index) =>
    renderInline(inline, index),
  );

  if (parts.length === 0) {
    return "";
  }

  return parts.length === 1 ? parts[0] : parts;
}

/**
 * Minimal Slice A inline renderer: **strong** → <strong>.
 * @deprecated Morphing MUST use preset interactiveRenderers.
 */
export function renderParagraphInline(markdown: string): ReactNode {
  const text = markdown.replace(/\n+$/, "");
  const parts: ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(createElement("strong", { key: key++ }, match[1]));
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  if (parts.length === 0) {
    return text;
  }

  return parts.length === 1 ? parts[0] : parts;
}
