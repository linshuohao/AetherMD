import type {
  AetherBlock,
  AetherDoc,
  AetherInline,
  HeadingBlock,
  ParagraphBlock,
  TextInline,
} from "@aether-md/core";
import { Schema, type Node as ProseMirrorNode } from "prosemirror-model";

export const aetherSchema = new Schema({
  nodes: {
    doc: { content: "block+" },
    paragraph: { group: "block", content: "inline*" },
    heading: {
      group: "block",
      content: "inline*",
      attrs: { level: { default: 1 } },
    },
    text: { group: "inline" },
  },
});

function inlineToPm(inline: AetherInline): ProseMirrorNode | null {
  if (inline.type === "text") {
    return aetherSchema.text((inline as TextInline).text);
  }

  if (inline.type === "link" || inline.type === "mark") {
    const text = inline.children
      .filter((child): child is TextInline => child.type === "text")
      .map((child) => child.text)
      .join("");
    return aetherSchema.text(text);
  }

  return null;
}

function blockToPm(block: AetherBlock): ProseMirrorNode {
  if (block.type === "paragraph") {
    const paragraph = block as ParagraphBlock;
    const content = paragraph.children
      .map(inlineToPm)
      .filter((node): node is ProseMirrorNode => node !== null);
    return aetherSchema.nodes.paragraph.create(null, content);
  }

  if (block.type === "heading") {
    const heading = block as HeadingBlock;
    const content = heading.children
      .map(inlineToPm)
      .filter((node): node is ProseMirrorNode => node !== null);
    return aetherSchema.nodes.heading.create({ level: heading.level }, content);
  }

  return aetherSchema.nodes.paragraph.create(null, [
    aetherSchema.text(JSON.stringify(block)),
  ]);
}

export function aetherDocToPm(doc: AetherDoc): ProseMirrorNode {
  const content = doc.children.map(blockToPm);
  return aetherSchema.nodes.doc.create(null, content);
}

function pmInlineToAether(node: ProseMirrorNode): AetherInline {
  return { type: "text", text: node.text ?? "" };
}

function pmBlockToAether(node: ProseMirrorNode): AetherBlock {
  if (node.type.name === "paragraph") {
    const children = node.content.content.map(pmInlineToAether);
    return { type: "paragraph", children };
  }

  if (node.type.name === "heading") {
    const level = node.attrs.level as HeadingBlock["level"];
    const children = node.content.content.map(pmInlineToAether);
    return { type: "heading", level, children };
  }

  return {
    type: "paragraph",
    children: [{ type: "text", text: node.textContent }],
  };
}

export function pmToAetherDoc(node: ProseMirrorNode): AetherDoc {
  const children = node.content.content.map(pmBlockToAether);
  return { type: "doc", children };
}
