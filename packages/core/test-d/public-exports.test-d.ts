import { expectType } from "tsd";

import {
  createBlockId,
  createEditor,
  ensureDocumentBlockIds,
  findBlockIndexById,
  type AetherEditor,
} from "@aether-md/core";

void createEditor;
void createBlockId;
void ensureDocumentBlockIds;
void findBlockIndexById;

expectType<unknown>({} as AetherEditor["morphing"]);
expectType<unknown>(
  ({} as AetherEditor).getMorphingStrategy("paragraph"),
);
