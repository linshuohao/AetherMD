import { expectType } from "tsd";

import {
  createProseMirrorEngineAdapter,
  createProseMirrorView,
} from "@aether-md/plugin-prosemirror";

expectType<ReturnType<typeof createProseMirrorEngineAdapter>>(createProseMirrorEngineAdapter());

void createProseMirrorView;
