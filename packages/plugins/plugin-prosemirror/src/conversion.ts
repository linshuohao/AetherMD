import type {
  AetherBlock,
  AetherDoc,
  AetherInline,
  HeadingBlock,
  LinkInline,
  ListBlock,
  MarkedInline,
  ParagraphBlock,
  TextInline,
} from "@aether-md/core";
import { Schema, type Mark as ProseMirrorMark, type Node as ProseMirrorNode } from "prosemirror-model";

export const aetherSchema = new Schema({
  nodes: {
    doc: { content: "block+" },
    paragraph: { group: "block", content: "inline*" },
    heading: {
      group: "block",
      content: "inline*",
      attrs: { level: { default: 1 } },
    },
    bullet_list: { group: "block", content: "list_item+" },
    ordered_list: {
      group: "block",
      content: "list_item+",
      attrs: { order: { default: 1 } },
    },
    list_item: { content: "block+" },
    text: { group: "inline" },
  },
  marks: {
    strong: {},
    emphasis: {},
    link: {
      attrs: { href: {}, title: { default: null } },
      inclusive: false,
    },
  },
});

function textNode(text: string, marks: ProseMirrorMark[] = []): ProseMirrorNode {
  return aetherSchema.text(text, marks);
}

function inlineToPm(inline: AetherInline): ProseMirrorNode | null {
  if (inline.type === "text") {
    return textNode((inline as TextInline).text);
  }

  if (inline.type === "mark") {
    const marked = inline as MarkedInline;
    const text = marked.children
      .filter((child): child is TextInline => child.type === "text")
      .map((child) => child.text)
      .join("");

    if (marked.mark === "strong") {
      return textNode(text, [aetherSchema.marks.strong.create()]);
    }

    if (marked.mark === "emphasis") {
      return textNode(text, [aetherSchema.marks.emphasis.create()]);
    }

    return textNode(text);
  }

  if (inline.type === "link") {
    const link = inline as LinkInline;
    const text = link.children
      .filter((child): child is TextInline => child.type === "text")
      .map((child) => child.text)
      .join("");

    return textNode(text, [
      aetherSchema.marks.link.create({
        href: link.href,
        title: link.title ?? null,
      }),
    ]);
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

  if (block.type === "list") {
    const list = block as ListBlock;
    const listType = list.ordered
      ? aetherSchema.nodes.ordered_list
      : aetherSchema.nodes.bullet_list;
    const items = list.items.map((itemBlocks) =>
      aetherSchema.nodes.list_item.create(null, itemBlocks.map(blockToPm)),
    );
    return listType.create(null, items);
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
  const text = node.text ?? "";

  for (const mark of node.marks) {
    if (mark.type.name === "link") {
      return {
        type: "link",
        href: mark.attrs.href as string,
        ...(mark.attrs.title ? { title: mark.attrs.title as string } : {}),
        children: [{ type: "text", text }],
      };
    }

    if (mark.type.name === "strong") {
      return {
        type: "mark",
        mark: "strong",
        children: [{ type: "text", text }],
      };
    }

    if (mark.type.name === "emphasis") {
      return {
        type: "mark",
        mark: "emphasis",
        children: [{ type: "text", text }],
      };
    }
  }

  return { type: "text", text };
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

  if (node.type.name === "bullet_list" || node.type.name === "ordered_list") {
    const items = node.content.content.map((itemNode) =>
      itemNode.content.content.map(pmBlockToAether),
    );
    return {
      type: "list",
      ordered: node.type.name === "ordered_list",
      items,
    };
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
