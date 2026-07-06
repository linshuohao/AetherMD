import type { AetherDoc, AetherSchema, ParserAdapter } from "@aether-md/core";
import type { Root } from "mdast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

import { mdastToAetherDoc } from "./mdast-mapping.js";

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
