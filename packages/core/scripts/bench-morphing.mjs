#!/usr/bin/env node
/**
 * Morphing / editor dispatch performance baseline (non-gating).
 * Run from repo root: pnpm bench:morphing
 */
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const { createEditor } = await import(join(packageRoot, "dist/index.js"));
const { createGfmPreset } = await import(join(packageRoot, "../preset-gfm/dist/index.js"));

const ITERATIONS = 1000;
const ENGINE_REPLACE_TEXT_COMMAND = "core:replaceText";

function createBootstrapStubPlugin() {
  return {
    manifest: {
      metadata: {
        manifestVersion: 1,
        name: "core-bootstrap-stub",
        provides: ["core:bootstrap"],
      },
    },
  };
}

function createRemarkStubPlugin() {
  return {
    manifest: {
      metadata: {
        manifestVersion: 1,
        name: "remark",
      },
    },
  };
}

function createProsemirrorStubPlugin() {
  return {
    manifest: {
      metadata: {
        manifestVersion: 1,
        name: "prosemirror",
      },
    },
  };
}

function createGfmEditorPlugins() {
  const preset = createGfmPreset();
  return [
    createBootstrapStubPlugin(),
    createRemarkStubPlugin(),
    createProsemirrorStubPlugin(),
    {
      manifest: preset.manifest,
      adapters: {
        parser: preset.parser,
        serializer: preset.serializer,
        engine: preset.engine,
      },
      morphingStrategies: preset.morphingStrategies,
    },
  ];
}

function percentile(sortedMs, p) {
  const index = Math.min(sortedMs.length - 1, Math.ceil((p / 100) * sortedMs.length) - 1);
  return sortedMs[Math.max(0, index)];
}

function summarize(label, samplesMs) {
  const sorted = [...samplesMs].sort((a, b) => a - b);
  const total = sorted.reduce((sum, value) => sum + value, 0);
  console.log(
    `${label}: n=${sorted.length} mean=${(total / sorted.length).toFixed(3)}ms p50=${percentile(sorted, 50).toFixed(3)}ms p95=${percentile(sorted, 95).toFixed(3)}ms`,
  );
}

async function main() {
  const editor = await createEditor({
    plugins: createGfmEditorPlugins(),
    initialValue: "Hello **world**\n",
  });

  const morphLookupMs = [];
  for (let index = 0; index < ITERATIONS; index += 1) {
    const start = performance.now();
    editor.getMorphingStrategy("paragraph");
    morphLookupMs.push(performance.now() - start);
  }

  const serializeMs = [];
  for (let index = 0; index < ITERATIONS; index += 1) {
    const start = performance.now();
    await editor.getMarkdown();
    serializeMs.push(performance.now() - start);
  }

  const dispatchMs = [];
  for (let index = 0; index < ITERATIONS; index += 1) {
    const start = performance.now();
    await editor.dispatch({
      id: ENGINE_REPLACE_TEXT_COMMAND,
      payload: { blockIndex: 0, text: `edit-${index}` },
    });
    dispatchMs.push(performance.now() - start);
  }

  console.log(`Morphing bench (${ITERATIONS} iterations each, Node ${process.version})`);
  summarize("getMorphingStrategy(paragraph)", morphLookupMs);
  summarize("getMarkdown", serializeMs);
  summarize("dispatch core:replaceText", dispatchMs);

  await editor.dispose();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
