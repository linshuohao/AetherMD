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
import {
  Schema,
  type Mark as ProseMirrorMark,
  type Node as ProseMirrorNode,
} from "prosemirror-model";

export const aetherSchema = new Schema({
  nodes: {
    doc: { content: "block+" },
    paragraph: {
      group: "block",
      content: "inline*",
      toDOM: () => ["p", 0],
      parseDOM: [{ tag: "p" }],
    },
    heading: {
      group: "block",
      content: "inline*",
      attrs: { level: { default: 1 } },
      toDOM: (node) => [`h${node.attrs.level}`, 0],
      parseDOM: [
        { tag: "h1", attrs: { level: 1 } },
        { tag: "h2", attrs: { level: 2 } },
        { tag: "h3", attrs: { level: 3 } },
        { tag: "h4", attrs: { level: 4 } },
        { tag: "h5", attrs: { level: 5 } },
        { tag: "h6", attrs: { level: 6 } },
      ],
    },
    bullet_list: {
      group: "block",
      content: "list_item+",
      toDOM: () => ["ul", 0],
      parseDOM: [{ tag: "ul" }],
    },
    ordered_list: {
      group: "block",
      content: "list_item+",
      attrs: { order: { default: 1 } },
      toDOM: () => ["ol", 0],
      parseDOM: [{ tag: "ol" }],
    },
    list_item: {
      content: "block+",
      toDOM: () => ["li", 0],
      parseDOM: [{ tag: "li" }],
    },
    text: { group: "inline" },
  },
  marks: {
    strong: {
      toDOM: () => ["strong", 0],
      parseDOM: [{ tag: "strong" }, { tag: "b" }],
    },
    emphasis: {
      toDOM: () => ["em", 0],
      parseDOM: [{ tag: "em" }, { tag: "i" }],
    },
    link: {
      attrs: { href: {}, title: { default: null } },
      inclusive: false,
      toDOM: (mark) => ["a", { href: mark.attrs.href, title: mark.attrs.title }, 0],
      parseDOM: [
        {
          tag: "a[href]",
          getAttrs: (dom) => {
            const element = dom as HTMLAnchorElement;
            return { href: element.getAttribute("href"), title: element.getAttribute("title") };
          },
        },
      ],
    },
  },
});

function textNode(text: string, marks: ProseMirrorMark[] = []): ProseMirrorNode | null {
  if (text.length === 0) {
    return null;
  }

  return aetherSchema.text(text, marks);
}

function inlineToPm(inline: AetherInline, marks: ProseMirrorMark[] = []): ProseMirrorNode[] {
  if (inline.type === "text") {
    const node = textNode((inline as TextInline).text, marks);
    return node ? [node] : [];
  }

  if (inline.type === "mark") {
    const marked = inline as MarkedInline;
    if (marked.mark === "strong") {
      return marked.children.flatMap((child) =>
        inlineToPm(child, [...marks, aetherSchema.marks.strong.create()]),
      );
    }

    if (marked.mark === "emphasis") {
      return marked.children.flatMap((child) =>
        inlineToPm(child, [...marks, aetherSchema.marks.emphasis.create()]),
      );
    }

    return marked.children.flatMap((child) => inlineToPm(child, marks));
  }

  if (inline.type === "link") {
    const link = inline as LinkInline;
    const linkMark = aetherSchema.marks.link.create({
      href: link.href,
      title: link.title ?? null,
    });

    return link.children.flatMap((child) => inlineToPm(child, [...marks, linkMark]));
  }

  return [];
}

function blockToPm(block: AetherBlock): ProseMirrorNode {
  if (block.type === "paragraph") {
    const paragraph = block as ParagraphBlock;
    const content = paragraph.children.flatMap((inline) => inlineToPm(inline));
    return aetherSchema.nodes.paragraph.create(null, content);
  }

  if (block.type === "heading") {
    const heading = block as HeadingBlock;
    const content = heading.children.flatMap((inline) => inlineToPm(inline));
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

  return aetherSchema.nodes.paragraph.create(null, [aetherSchema.text(JSON.stringify(block))]);
}

export function aetherDocToPm(doc: AetherDoc): ProseMirrorNode {
  const content = doc.children.map(blockToPm);
  return aetherSchema.nodes.doc.create(null, content);
}

function wrapTextInMarks(text: string, marks: readonly ProseMirrorMark[]): AetherInline {
  const orderedMarks = [...marks].sort((left, right) => {
    const rank: Record<string, number> = { link: 0, strong: 1, emphasis: 2 };
    return (rank[left.type.name] ?? 99) - (rank[right.type.name] ?? 99);
  });

  return orderedMarks.reduceRight<AetherInline>(
    (child, mark) => {
      if (mark.type.name === "link") {
        return {
          type: "link",
          href: mark.attrs.href as string,
          ...(mark.attrs.title ? { title: mark.attrs.title as string } : {}),
          children: [child],
        };
      }

      if (mark.type.name === "strong") {
        return {
          type: "mark",
          mark: "strong",
          children: [child],
        };
      }

      if (mark.type.name === "emphasis") {
        return {
          type: "mark",
          mark: "emphasis",
          children: [child],
        };
      }

      return child;
    },
    { type: "text", text },
  );
}

function canMergeInline(left: AetherInline, right: AetherInline): boolean {
  if (left.type !== right.type) {
    return false;
  }

  if (left.type === "mark" && right.type === "mark") {
    return left.mark === right.mark;
  }

  if (left.type === "link" && right.type === "link") {
    return left.href === right.href && left.title === right.title;
  }

  return false;
}

function mergeInlineSiblings(inlines: AetherInline[]): AetherInline[] {
  const merged: AetherInline[] = [];

  for (const inline of inlines) {
    const normalized =
      inline.type === "mark" || inline.type === "link"
        ? { ...inline, children: mergeInlineSiblings(inline.children) }
        : inline;
    const previous = merged[merged.length - 1];

    if (previous && canMergeInline(previous, normalized)) {
      if (previous.type === "mark" && normalized.type === "mark") {
        previous.children = mergeInlineSiblings([...previous.children, ...normalized.children]);
        continue;
      }

      if (previous.type === "link" && normalized.type === "link") {
        previous.children = mergeInlineSiblings([...previous.children, ...normalized.children]);
        continue;
      }
    }

    merged.push(normalized);
  }

  return merged;
}

function pmInlineToAether(node: ProseMirrorNode): AetherInline {
  return wrapTextInMarks(node.text ?? "", node.marks);
}

function pmInlineContentToAether(node: ProseMirrorNode): AetherInline[] {
  return mergeInlineSiblings(node.content.content.map(pmInlineToAether));
}

export function pmBlockToAether(node: ProseMirrorNode): AetherBlock {
  if (node.type.name === "paragraph") {
    const children = pmInlineContentToAether(node);
    return { type: "paragraph", children };
  }

  if (node.type.name === "heading") {
    const level = node.attrs.level as HeadingBlock["level"];
    const children = pmInlineContentToAether(node);
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
