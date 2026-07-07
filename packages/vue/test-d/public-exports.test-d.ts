import { expectType } from "tsd";

import { AetherEditorRoot, useAetherEditor, type UseAetherEditorResult } from "@aether-md/vue";

expectType<typeof AetherEditorRoot>(AetherEditorRoot);
expectType<() => UseAetherEditorResult>(useAetherEditor);
