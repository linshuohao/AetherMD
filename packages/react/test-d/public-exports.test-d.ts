import { expectType } from "tsd";

import {
  AetherEditorRoot,
  AetherMorphingContent,
  AetherMorphingDocument,
  useAetherEditor,
  type UseAetherEditorResult,
} from "@aether-md/react";

expectType<typeof AetherEditorRoot>(AetherEditorRoot);
expectType<typeof AetherMorphingContent>(AetherMorphingContent);
expectType<typeof AetherMorphingDocument>(AetherMorphingDocument);
expectType<() => UseAetherEditorResult>(useAetherEditor);
