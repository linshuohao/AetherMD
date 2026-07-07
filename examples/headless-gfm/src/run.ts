import { createEditor, type CommandId } from "@aether-md/core";
import { createGfmEditorPlugins } from "@aether-md/example-shared";
import { SHOWCASE_MARKDOWN } from "@aether-md/example-shared/showcase-markdown";

const ENGINE_REPLACE_TEXT_COMMAND = "core:replaceText" as CommandId;

async function main(): Promise<void> {
  const editor = await createEditor({
    plugins: createGfmEditorPlugins(),
    initialValue: SHOWCASE_MARKDOWN,
  });

  const roundTrip = await editor.getMarkdown();
  console.log(roundTrip);

  const editResult = await editor.dispatch({
    id: ENGINE_REPLACE_TEXT_COMMAND,
    payload: { blockIndex: 0, text: "Hello **world** — edited headlessly" },
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
