import { expectType } from "tsd";

import {
  AetherEditorContent,
  AetherEditorRoot,
  useAetherEditor,
  type UseAetherEditorResult,
} from "@aether-md/vue";

expectType<typeof AetherEditorRoot>(AetherEditorRoot);
expectType<typeof AetherEditorContent>(AetherEditorContent);
expectType<() => UseAetherEditorResult>(useAetherEditor);
