import { expectType } from "tsd";

import type { AetherBlock, AetherDoc, AetherSchema } from "@aether-md/core/document";

expectType<AetherDoc>({} as AetherDoc);
expectType<AetherBlock>({} as AetherBlock);
expectType<AetherSchema>({} as AetherSchema);
