import { createElement, type ReactNode } from "react";

/**
 * Minimal Slice A inline renderer: **strong** → <strong>.
 * Slice B+ should move to preset interactiveRenderers.
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

export function paragraphSourceFromMarkdown(markdown: string): string {
  return markdown.replace(/\n+$/, "");
}
