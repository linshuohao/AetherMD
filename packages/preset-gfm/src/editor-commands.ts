import { type CommandEventRuntime } from "@aether-md/core/plugin";
import { type ParserAdapter } from "@aether-md/core/adapter";
import { type AetherSchema } from "@aether-md/core/document";

import {
  PARSE_BLOCK_MARKDOWN_COMMAND,
  type ParseBlockMarkdownPayload,
} from "@aether-md/morphing-contracts";

export interface GfmEditorCommandDeps {
  parser: ParserAdapter;
  schema: AetherSchema;
}

export function registerGfmEditorCommands(
  runtime: CommandEventRuntime,
  deps: GfmEditorCommandDeps,
): void {
  runtime.register(
    PARSE_BLOCK_MARKDOWN_COMMAND,
    (command) => {
      const payload = command.payload as ParseBlockMarkdownPayload | undefined;
      if (!payload || typeof payload.markdown !== "string") {
        return false;
      }

      return {
        value: deps.parser
          .parse(payload.markdown, deps.schema)
          .then((parsed) => parsed.children[0]),
      };
    },
    { mutating: false },
  );
}
