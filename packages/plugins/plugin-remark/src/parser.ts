import type {
  AetherBlock,
  AetherDoc,
  AetherInline,
  AetherSchema,
  HeadingBlock,
  ListBlock,
  ParagraphBlock,
  ParserAdapter,
  TextInline,
} from "@aether-md/core";
import type {
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
import remarkParse from "remark-parse";
import { unified } from "unified";

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
    blocks.push(blockFromNode(child));
  }

  return blocks;
}

function blockFromNode(node: Content): AetherBlock {
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

function mdastToAetherDoc(root: Root): AetherDoc {
  const children = root.children.map((node) => blockFromNode(node));

  return {
    type: "doc",
    children: children.length > 0 ? children : [paragraphFromText("")],
  };
}

export function createRemarkParserAdapter(): ParserAdapter {
  const processor = unified().use(remarkParse).use(remarkGfm);

  return {
    name: "remark-parser",
    async parse(markdown: string, _schema: AetherSchema): Promise<AetherDoc> {
      const tree = processor.parse(markdown) as Root;
      return mdastToAetherDoc(tree);
    },
  };
}
