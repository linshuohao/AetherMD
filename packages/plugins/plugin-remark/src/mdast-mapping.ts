import type {
  AetherBlock,
  AetherDoc,
  AetherInline,
  CustomBlock,
  HeadingBlock,
  ListBlock,
  ParagraphBlock,
  TextInline,
} from "@aether-md/core";
import { SerializationError } from "@aether-md/core";
import type {
  BlockContent,
  Content,
  Emphasis,
  Heading,
  Link,
  List,
  ListItem,
  Paragraph,
  PhrasingContent,
  Root,
  Strong,
  Text,
} from "mdast";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

const stringifyProcessor = unified()
  .use(remarkGfm)
  .use(remarkStringify, {
    bullet: "-",
    emphasis: "*",
    strong: "*",
  });

function textInline(value: string): TextInline {
  return { type: "text", text: value };
}

function paragraphFromText(value: string): ParagraphBlock {
  return { type: "paragraph", children: [textInline(value)] };
}

function inlineFromPhrasing(content: PhrasingContent[]): AetherInline[] {
  const inlines: AetherInline[] = [];

  for (const node of content) {
    if (node.type === "text") {
      inlines.push(textInline((node as Text).value));
      continue;
    }

    if (node.type === "strong") {
      inlines.push({
        type: "mark",
        mark: "strong",
        children: inlineFromPhrasing((node as Strong).children),
      });
      continue;
    }

    if (node.type === "emphasis") {
      inlines.push({
        type: "mark",
        mark: "emphasis",
        children: inlineFromPhrasing((node as Emphasis).children),
      });
      continue;
    }

    if (node.type === "link") {
      const link = node as Link;
      inlines.push({
        type: "link",
        href: link.url,
        ...(link.title ? { title: link.title } : {}),
        children: inlineFromPhrasing(link.children),
      });
      continue;
    }

    inlines.push(textInline(stringifyUnknownNode(node as Content)));
  }

  return inlines.length > 0 ? inlines : [textInline("")];
}

function stringifyUnknownNode(node: Content): string {
  if ("value" in node && typeof node.value === "string") {
    return node.value;
  }

  return JSON.stringify(node);
}

function listItemToBlocks(item: ListItem): AetherBlock[] {
  const blocks: AetherBlock[] = [];

  for (const child of item.children) {
    if (child.type === "definition") {
      continue;
    }
    blocks.push(blockFromMdast(child));
  }

  return blocks;
}

function blockFromMdast(node: Content): AetherBlock {
  if (node.type === "paragraph") {
    return {
      type: "paragraph",
      children: inlineFromPhrasing((node as Paragraph).children),
    };
  }

  if (node.type === "heading") {
    const heading = node as Heading;
    const level = heading.depth;
    if (level < 1 || level > 6) {
      return paragraphFromText(stringifyUnknownNode(node));
    }

    return {
      type: "heading",
      level: level as HeadingBlock["level"],
      children: inlineFromPhrasing(heading.children),
    };
  }

  if (node.type === "list") {
    const list = node as List;
    const listBlock: ListBlock = {
      type: "list",
      ordered: list.ordered ?? false,
      items: list.children.map((item) => listItemToBlocks(item)),
    };
    return listBlock;
  }

  return paragraphFromText(stringifyUnknownNode(node));
}

export function mdastToAetherDoc(root: Root): AetherDoc {
  const children = root.children.map((node) => blockFromMdast(node));

  return {
    type: "doc",
    children: children.length > 0 ? children : [paragraphFromText("")],
  };
}

function phrasingFromInline(inline: AetherInline): PhrasingContent[] {
  if (inline.type === "text") {
    return [{ type: "text", value: (inline as TextInline).text }];
  }

  if (inline.type === "mark") {
    const text = inline.children.flatMap((child) => phrasingFromInline(child));
    if (inline.mark === "strong") {
      return [{ type: "strong", children: text }];
    }
    if (inline.mark === "emphasis") {
      return [{ type: "emphasis", children: text }];
    }
    return text;
  }

  if (inline.type === "link") {
    return [
      {
        type: "link",
        url: inline.href,
        ...(inline.title ? { title: inline.title } : {}),
        children: inline.children.flatMap((child) => phrasingFromInline(child)),
      },
    ];
  }

  throw new SerializationError({
    code: "UNSUPPORTED_NODE",
    message: `Unsupported inline type: ${(inline as { type: string }).type}`,
  });
}

function blockToMdast(block: AetherBlock): BlockContent {
  if (block.type === "paragraph") {
    const paragraph = block as ParagraphBlock;
    return {
      type: "paragraph",
      children: paragraph.children.flatMap((inline) => phrasingFromInline(inline)),
    };
  }

  if (block.type === "heading") {
    const heading = block as HeadingBlock;
    return {
      type: "heading",
      depth: heading.level,
      children: heading.children.flatMap((inline) => phrasingFromInline(inline)),
    };
  }

  if (block.type === "list") {
    const list = block as ListBlock;
    return {
      type: "list",
      ordered: list.ordered,
      spread: false,
      children: list.items.map((itemBlocks) => ({
        type: "listItem",
        spread: false,
        children: itemBlocks.map((itemBlock) => blockToMdast(itemBlock)),
      })),
    };
  }

  if (block.type === "custom") {
    const custom = block as CustomBlock;
    return {
      type: "html",
      value: `[unsupported:block:${custom.name}]`,
    };
  }

  throw new SerializationError({
    code: "UNSUPPORTED_NODE",
    message: `Unsupported block type: ${(block as { type: string }).type}`,
  });
}

export function aetherDocToMdast(doc: AetherDoc): Root {
  return {
    type: "root",
    children: doc.children.map((block) => blockToMdast(block)),
  };
}

export function stringifyMdast(root: Root): string {
  return stringifyProcessor.stringify(root);
}

export function serializeParagraphInlines(block: ParagraphBlock): string {
  const paragraph = blockToMdast(block) as Paragraph;
  const wrapped: Root = { type: "root", children: [paragraph] };
  return stringifyMdast(wrapped).replace(/\n+$/, "");
}

export function serializeInlineToMarkdown(inline: AetherInline): string {
  const paragraph: Paragraph = {
    type: "paragraph",
    children: phrasingFromInline(inline),
  };
  const wrapped: Root = { type: "root", children: [paragraph] };
  return stringifyMdast(wrapped).replace(/\n+$/, "");
}

export function serializeListBlock(block: ListBlock): string {
  const root = aetherDocToMdast({
    type: "doc",
    children: [block],
  });
  return stringifyMdast(root).replace(/\n+$/, "");
}
