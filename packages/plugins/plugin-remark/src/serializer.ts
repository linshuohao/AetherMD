import type {
  AetherBlock,
  AetherDoc,
  AetherInline,
  AetherSchema,
  CustomBlock,
  HeadingBlock,
  ListBlock,
  ParagraphBlock,
  SerializerAdapter,
} from "@aether-md/core";
import { SerializationError } from "@aether-md/core";

function serializeInline(inline: AetherInline): string {
  if (inline.type === "text") {
    return inline.text;
  }

  if (inline.type === "link") {
    const text = inline.children.map(serializeInline).join("");
    return `[${text}](${inline.href})`;
  }

  if (inline.type === "mark") {
    const text = inline.children.map(serializeInline).join("");
    if (inline.mark === "strong") {
      return `**${text}**`;
    }
    if (inline.mark === "emphasis") {
      return `*${text}*`;
    }
    return text;
  }

  throw new SerializationError({
    code: "UNSUPPORTED_NODE",
    message: `Unsupported inline type: ${(inline as { type: string }).type}`,
  });
}

function serializeListBlock(list: ListBlock): string {
  return list.items
    .map((item, index) => {
      const itemText = item.map(serializeBlock).join("\n");
      if (list.ordered) {
        return `${index + 1}. ${itemText}`;
      }
      return `- ${itemText}`;
    })
    .join("\n");
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
    return serializeListBlock(block);
  }

  if (block.type === "custom") {
    const custom = block as CustomBlock;
    return `[unsupported:block:${custom.name}]`;
  }

  throw new SerializationError({
    code: "UNSUPPORTED_NODE",
    message: `Unsupported block type: ${(block as { type: string }).type}`,
  });
}

export function createRemarkSerializerAdapter(): SerializerAdapter {
  return {
    name: "remark-serializer",
    async serialize(doc: AetherDoc, _schema: AetherSchema): Promise<string> {
      try {
        const blocks = doc.children.map(serializeBlock);
        return `${blocks.join("\n\n")}\n`;
      } catch (error) {
        if (error instanceof SerializationError) {
          throw error;
        }

        throw new SerializationError({
          code: "SERIALIZE_FAILED",
          message: "Failed to serialize document",
          cause: error,
        });
      }
    },
  };
}
