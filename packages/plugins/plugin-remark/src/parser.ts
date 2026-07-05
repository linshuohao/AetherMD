import type {
  AetherBlock,
  AetherDoc,
  AetherInline,
  AetherSchema,
  HeadingBlock,
  ParagraphBlock,
  ParserAdapter,
  TextInline,
} from "@aether-md/core";
import type { Content, Heading, Paragraph, Root, Text } from "mdast";
import remarkParse from "remark-parse";
import { unified } from "unified";

function textInline(value: string): TextInline {
  return { type: "text", text: value };
}

function paragraphFromText(value: string): ParagraphBlock {
  return { type: "paragraph", children: [textInline(value)] };
}

function inlineFromPhrasing(content: Content[]): AetherInline[] {
  const inlines: AetherInline[] = [];

  for (const node of content) {
    if (node.type === "text") {
      inlines.push(textInline((node as Text).value));
      continue;
    }

    inlines.push(textInline(stringifyUnknownNode(node)));
  }

  return inlines.length > 0 ? inlines : [textInline("")];
}

function stringifyUnknownNode(node: Content): string {
  if ("value" in node && typeof node.value === "string") {
    return node.value;
  }

  return JSON.stringify(node);
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
  const processor = unified().use(remarkParse);

  return {
    name: "remark-parser",
    async parse(markdown: string, _schema: AetherSchema): Promise<AetherDoc> {
      const tree = processor.parse(markdown) as Root;
      return mdastToAetherDoc(tree);
    },
  };
}
