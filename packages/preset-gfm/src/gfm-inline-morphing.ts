import type { AetherInline, ParagraphBlock } from "@aether-md/core";

export function serializeInlineToMarkdown(inline: AetherInline): string {
  if (inline.type === "text") {
    return inline.text;
  }

  if (inline.type === "mark") {
    const text = inline.children.map(serializeInlineToMarkdown).join("");
    if (inline.mark === "strong") {
      return `**${text}**`;
    }
    if (inline.mark === "emphasis") {
      return `*${text}*`;
    }
    return text;
  }

  if (inline.type === "link") {
    const text = inline.children.map(serializeInlineToMarkdown).join("");
    return `[${text}](${inline.href})`;
  }

  return "";
}

export function serializeParagraphInlines(block: ParagraphBlock): string {
  return block.children.map(serializeInlineToMarkdown).join("");
}
