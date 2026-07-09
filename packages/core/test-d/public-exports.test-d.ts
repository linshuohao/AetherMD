import { createEditor, type AetherEditor } from "@aether-md/core";
import { expectType } from "tsd";

void createEditor;

expectType<AetherEditor["morphing"]>({} as AetherEditor["morphing"]);
expectType<unknown>(({} as AetherEditor).getMorphingStrategy("paragraph"));
