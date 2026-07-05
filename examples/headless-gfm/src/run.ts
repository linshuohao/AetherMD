import { createGfmPreset } from "@aether-md/preset-gfm";
import {
  createEditor,
  type CommandId,
  type EngineAdapter,
  type ExtensionPlugin,
  type ParserAdapter,
  type SerializerAdapter,
} from "@aether-md/core";

const ENGINE_REPLACE_TEXT_COMMAND = "core:replaceText" as CommandId;

const FIXTURE_MARKDOWN = "**bold**\n";

interface ExtensionPluginWithAdapters extends ExtensionPlugin {
  adapters?: {
    parser: ParserAdapter;
    serializer: SerializerAdapter;
    engine: EngineAdapter;
  };
}

function createBootstrapStubPlugin(): ExtensionPlugin {
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

function createRemarkStubPlugin(): ExtensionPlugin {
  return {
    manifest: {
      metadata: {
        manifestVersion: 1,
        name: "remark",
      },
    },
  };
}

function createProsemirrorStubPlugin(): ExtensionPlugin {
  return {
    manifest: {
      metadata: {
        manifestVersion: 1,
        name: "prosemirror",
      },
    },
  };
}

function toExtensionPluginFromPreset(
  preset: ReturnType<typeof createGfmPreset>,
): ExtensionPluginWithAdapters {
  return {
    manifest: preset.manifest,
    adapters: {
      parser: preset.parser,
      serializer: preset.serializer,
      engine: preset.engine,
    },
  };
}

function createGfmEditorPlugins(): ExtensionPluginWithAdapters[] {
  const preset = createGfmPreset();
  return [
    createBootstrapStubPlugin(),
    createRemarkStubPlugin(),
    createProsemirrorStubPlugin(),
    toExtensionPluginFromPreset(preset),
  ];
}

async function main(): Promise<void> {
  const editor = await createEditor({
    plugins: createGfmEditorPlugins(),
    initialValue: FIXTURE_MARKDOWN,
  });

  const roundTrip = await editor.getMarkdown();
  console.log(roundTrip);

  const editResult = await editor.dispatch({
    id: ENGINE_REPLACE_TEXT_COMMAND,
    payload: { blockIndex: 0, text: "**bold** edited" },
  });

  if (!editResult.ok) {
    console.error("replaceText dispatch failed:", editResult);
    process.exitCode = 1;
    await editor.dispose();
    return;
  }

  const edited = await editor.getMarkdown();
  console.log(edited);

  await editor.dispose();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
