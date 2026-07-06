import { expectType } from "tsd";

import { createRemarkParserAdapter, createRemarkSerializerAdapter } from "@aether-md/plugin-remark";

expectType<ReturnType<typeof createRemarkParserAdapter>>(createRemarkParserAdapter());
expectType<ReturnType<typeof createRemarkSerializerAdapter>>(createRemarkSerializerAdapter());
