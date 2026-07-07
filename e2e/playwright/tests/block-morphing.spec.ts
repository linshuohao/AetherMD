import { expect, test } from "@playwright/test";

import {
  block,
  blockById,
  editSource,
  blurBlock,
  expectEditorStable,
  expectListItems,
  expectMarkdownContains,
  expectSingleSource,
  expectStableBlockIds,
  focusBlock,
  focusBlockWithTab,
  forceParentRerender,
  gotoMorphingDemo,
  moveListBlockDown,
  source,
  typeInSource,
  waitForBlockSynced,
  waitForRendered,
} from "../fixtures/editor";

test.describe("block-morphing demo e2e", () => {
  test("smoke: app boots and renders morphing blocks", async ({ page }) => {
    await gotoMorphingDemo(page);

    await expect(
      page.getByRole("heading", { name: "AetherMD Block Morphing — Slice D" }),
    ).toBeVisible();
    await expect(page.getByTestId("markdown-preview")).toHaveCount(0);
    await expect(block(page, 0)).toHaveAttribute("data-block-type", "paragraph");
    await expect(block(page, 1)).toHaveAttribute("data-block-type", "list");
    await expect(block(page, 2)).toHaveAttribute("data-block-type", "paragraph");
    await expectStableBlockIds(page);
  });

  test("block focus: focusing list switches only that block to source", async ({ page }) => {
    await gotoMorphingDemo(page);

    await focusBlock(page, 1);

    const listBlock = block(page, 1);
    await expect(listBlock).toHaveAttribute("data-focused", "true");
    await expect(listBlock.getByTestId("morphing-source")).toBeVisible();
    await expect(block(page, 0).getByTestId("morphing-rendered")).toBeVisible();
    await expect(block(page, 2).getByTestId("morphing-rendered")).toBeVisible();
    await expectSingleSource(page);
    await expect(source(page, 1)).toHaveValue(/- alpha/);
    await expect(source(page, 1)).toHaveValue(/- beta/);
  });

  test("instant morphing: source edit and blur re-renders list", async ({ page }) => {
    await gotoMorphingDemo(page);

    await editSource(page, 1, "- one\n- two\n- three");
    await expectListItems(page, 1, ["one", "two", "three"]);
    await expectMarkdownContains(page, "- one");
  });

  test("regression: force parent rerender preserves edited content", async ({ page }) => {
    await gotoMorphingDemo(page);

    await editSource(page, 1, "- edited alpha\n- edited beta");
    await expectListItems(page, 1, ["edited alpha", "edited beta"]);

    await forceParentRerender(page);
    await expectListItems(page, 1, ["edited alpha", "edited beta"]);
    await expectEditorStable(page);
  });

  test("scenario C: focus switches across all blocks with single source state", async ({
    page,
  }) => {
    await gotoMorphingDemo(page);

    await focusBlock(page, 0);
    await expect(source(page, 0)).toHaveValue(/Hello \*\*world\*\*/);
    await expectSingleSource(page);

    await focusBlock(page, 1);
    await waitForRendered(page, 0);
    await expect(source(page, 1)).toBeVisible();
    await expectSingleSource(page);
    await expect(block(page, 0)).toHaveAttribute("data-focused", "false");

    await focusBlock(page, 2);
    await waitForRendered(page, 1);
    await expect(source(page, 2)).toBeVisible();
    await expectSingleSource(page);
    await expect(block(page, 1)).toHaveAttribute("data-focused", "false");
  });

  test("scenario A: focused paragraph shows ** Markdown sigils", async ({ page }) => {
    await gotoMorphingDemo(page);

    await focusBlock(page, 0);
    await expect(source(page, 0)).toHaveValue(/\*\*world\*\*/);
    await expect(page.getByTestId("markdown-preview")).toHaveCount(0);
  });

  test("scenario B: paragraph edit blur renders strong and syncs markdown", async ({ page }) => {
    await gotoMorphingDemo(page);

    await editSource(page, 0, "Hello **universe** with *emphasis*.");
    await expect(block(page, 0).locator("strong")).toHaveText("universe");
    await expect(block(page, 0).locator("em")).toHaveText("emphasis");
    await expectMarkdownContains(page, "**universe**");
  });

  test("slice B: emphasis focus shows * sigils and blur renders em", async ({ page }) => {
    await gotoMorphingDemo(page);

    await focusBlock(page, 0);
    await expect(source(page, 0)).toHaveValue(/\*emphasis\*/);
    await source(page, 0).blur();
    await waitForRendered(page, 0);
    await expect(block(page, 0).locator("em")).toHaveText("emphasis");
    await expect(block(page, 0).getByTestId("morphing-rendered")).not.toContainText("*emphasis*");
  });

  test("slice B: emphasis edit in source does not strip inline marks", async ({ page }) => {
    await gotoMorphingDemo(page);

    await editSource(page, 0, "Hello **bold** and *universe* today.");
    await expect(block(page, 0).locator("strong")).toHaveText("bold");
    await expect(block(page, 0).locator("em")).toHaveText("universe");
    await expectMarkdownContains(page, "*universe*");
  });

  test("slice B: link paragraph focus shows Markdown link syntax", async ({ page }) => {
    await gotoMorphingDemo(page);

    await focusBlock(page, 2);

    await expect(source(page, 2)).toHaveValue(/\[docs\]\(https:\/\/example\.com\)/);
    await expect(block(page, 0).getByTestId("morphing-rendered")).toBeVisible();
    await expect(block(page, 1).getByTestId("morphing-rendered")).toBeVisible();
    await expectSingleSource(page);
  });

  test("slice B: link blur renders clickable anchor", async ({ page }) => {
    await gotoMorphingDemo(page);

    await focusBlock(page, 2);
    await source(page, 2).blur();
    await waitForRendered(page, 2);

    const linkBlock = block(page, 2);
    await expect(linkBlock.locator('a[href="https://example.com"]')).toHaveText("docs");
    await expect(linkBlock.getByTestId("morphing-rendered")).not.toContainText("[docs]");
  });

  test("slice B: edit link in source updates rendered anchor after blur", async ({ page }) => {
    await gotoMorphingDemo(page);

    await editSource(page, 2, "See [guide](https://aether.dev) now.");

    const linkBlock = block(page, 2);
    await expect(linkBlock.locator('a[href="https://aether.dev"]')).toHaveText("guide");
    await expect(block(page, 0).locator("strong")).toHaveText("world");
    await expectListItems(page, 1, ["alpha", "beta"]);
    await expectMarkdownContains(page, "https://aether.dev");
  });

  test("isolation: editing list does not reset paragraph or link blocks", async ({ page }) => {
    await gotoMorphingDemo(page);

    await expect(block(page, 0).locator("strong")).toHaveText("world");
    await expect(block(page, 2).locator('a[href="https://example.com"]')).toHaveText("docs");

    await editSource(page, 1, "- x\n- y");

    await expect(block(page, 0).locator("strong")).toHaveText("world");
    await expect(block(page, 2).locator('a[href="https://example.com"]')).toHaveText("docs");
    await expectListItems(page, 1, ["x", "y"]);
  });

  test("browser path: click-to-focus switches blocks via pointer", async ({ page }) => {
    await gotoMorphingDemo(page);

    await focusBlock(page, 2, { via: "click" });
    await expect(source(page, 2)).toBeVisible();

    await focusBlock(page, 0, { via: "click" });
    await waitForRendered(page, 2);
    await expect(source(page, 0)).toBeVisible();
    await expectSingleSource(page);
  });

  test("keyboard: tab focus reaches morphing rendered surfaces", async ({ page }) => {
    await gotoMorphingDemo(page);

    await focusBlockWithTab(page, 0);
    await expect(source(page, 0)).toHaveValue(/\*\*world\*\*/);
  });

  test("typing: pressSequentially in source preserves marks after blur", async ({ page }) => {
    await gotoMorphingDemo(page);

    await typeInSource(page, 0, "Typed **bold** end", { blur: true, delay: 10 });
    await expect(block(page, 0).locator("strong")).toHaveText("bold");
    await expectMarkdownContains(page, "**bold**");
  });

  test("sync: blur waits for pending edits before morphing to rendered", async ({ page }) => {
    await gotoMorphingDemo(page);

    await focusBlock(page, 1);
    const textarea = source(page, 1);
    await textarea.fill("- sync-a\n- sync-b");
    await waitForBlockSynced(page, 1);
    await textarea.blur();
    await waitForRendered(page, 1);
    await expectListItems(page, 1, ["sync-a", "sync-b"]);
  });

  test("identity: moveBlock preserves focus on the same block id", async ({ page }) => {
    await gotoMorphingDemo(page);

    await focusBlock(page, 1);
    const listBlockId = await moveListBlockDown(page);

    const movedBlock = await blockById(page, listBlockId);
    await expect(movedBlock).toHaveAttribute("data-focused", "true");
    await expect(movedBlock.getByTestId("morphing-source")).toBeVisible();
    await expect(movedBlock.getByTestId("morphing-source")).toHaveValue(/- alpha/);
    await blurBlock(page, 2);
    await expectListItems(page, 2, ["alpha", "beta"]);
  });

  test("stability: consecutive edits and parent rerender do not remount editor", async ({
    page,
  }) => {
    await gotoMorphingDemo(page);

    await focusBlock(page, 0);
    const textarea = source(page, 0);
    await textarea.fill("Hello **edit-one**");
    await waitForBlockSynced(page, 0);
    await textarea.fill("Hello **edit-two**");
    await waitForBlockSynced(page, 0);
    await expectEditorStable(page);

    await forceParentRerender(page);
    await expectEditorStable(page);

    const block0 = block(page, 0);
    if ((await block0.getAttribute("data-focused")) === "true") {
      await blurBlock(page, 0);
    }
    await expect(block0.locator("strong")).toHaveText("edit-two");
  });
});
