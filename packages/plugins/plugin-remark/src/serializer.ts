import type {
  AetherBlock,
  AetherDoc,
  AetherInline,
  AetherSchema,
  HeadingBlock,
  ParagraphBlock,
  SerializerAdapter,
  TextInline,
} from "@aether-md/core";

function serializeInline(inline: AetherInline): string {
  if (inline.type === "text") {
    return inline.text;
  }

  if (inline.type === "link") {
    return inline.children.map(serializeInline).join("");
  }

  if (inline.type === "mark") {
    return inline.children.map(serializeInline).join("");
  }

  return "";
}

function serializeBlock(block: AetherBlock): string {
  if (block.type === "paragraph") {
    return (block as ParagraphBlock).children.map(serializeInline).join("");
  }

  if (block.type === "heading") {
    const heading = block as HeadingBlock;
    const prefix = "#".repeat(heading.level);
    const text = heading.children.map(serializeInline).join("");
    return `${prefix} ${text}`;
  }

  if (block.type === "list") {
    return block.items
      .map((item) => item.map(serializeBlock).join("\n"))
      .join("\n");
  }

  if (block.type === "custom") {
    return block.name;
  }

  return "";
}

export function createRemarkSerializerAdapter(): SerializerAdapter {
  return {
    name: "remark-serializer",
    async serialize(doc: AetherDoc, _schema: AetherSchema): Promise<string> {
      const blocks = doc.children.map(serializeBlock);
      return `${blocks.join("\n\n")}\n`;
    },
  };
}
