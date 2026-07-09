import { SerializationError, type SerializerAdapter } from "@aether-md/core/adapter";
import { type AetherDoc, type AetherSchema } from "@aether-md/core/document";

import { aetherDocToMdast, stringifyMdast } from "./mdast-mapping.js";

export function createRemarkSerializerAdapter(): SerializerAdapter {
  return {
    name: "remark-serializer",
    async serialize(doc: AetherDoc, _schema: AetherSchema): Promise<string> {
      try {
        const root = aetherDocToMdast(doc);
        const markdown = stringifyMdast(root);
        return markdown.endsWith("\n") ? markdown : `${markdown}\n`;
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
