import { expectType } from "tsd";

import { createGfmPreset, getGfmMorphingStrategy } from "@aether-md/preset-gfm";

const preset = createGfmPreset();

expectType<readonly import("@aether-md/core").MorphingBlockStrategy[]>(preset.morphingStrategies);

expectType<import("@aether-md/core").MorphingBlockStrategy | undefined>(
  getGfmMorphingStrategy("paragraph"),
);
