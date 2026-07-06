import { expect, test } from "@playwright/test";

import {
  block,
  editSource,
  expectListItems,
  expectSingleSource,
  focusBlock,
  forceParentRerender,
  gotoMorphingDemo,
  source,
  waitForBlockSynced,
  waitForRendered,
} from "../fixtures/editor";

test.describe("block-morphing demo e2e", () => {
  test("smoke: app boots and renders morphing blocks", async ({ page }) => {
    await gotoMorphingDemo(page);

    await expect(
      page.getByRole("heading", { name: "AetherMD Block Morphing — Slice D" }),
    ).toBeVisible();
    await expect(block(page, 0)).toHaveAttribute("data-block-type", "paragraph");
    await expect(block(page, 1)).toHaveAttribute("data-block-type", "list");
    await expect(block(page, 2)).toHaveAttribute("data-block-type", "paragraph");
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
  });

  test("regression: force parent rerender preserves edited content", async ({ page }) => {
    await gotoMorphingDemo(page);

    await editSource(page, 1, "- edited alpha\n- edited beta");
    await expectListItems(page, 1, ["edited alpha", "edited beta"]);

    await forceParentRerender(page);
    await expectListItems(page, 1, ["edited alpha", "edited beta"]);
  });

  test("scenario C: focus switches across all blocks with single source state", async ({
    page,
  }) => {
    await gotoMorphingDemo(page);

    await focusBlock(page, 0);
    await expect(source(page, 0)).toHaveValue("Intro paragraph");
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
    await expect(block(page, 0)).toContainText("Intro paragraph");
    await expectListItems(page, 1, ["alpha", "beta"]);
  });

  test("isolation: editing list does not reset intro or link blocks", async ({ page }) => {
    await gotoMorphingDemo(page);

    await expect(block(page, 0)).toContainText("Intro paragraph");
    await expect(block(page, 2).locator('a[href="https://example.com"]')).toHaveText("docs");

    await editSource(page, 1, "- x\n- y");

    await expect(block(page, 0)).toContainText("Intro paragraph");
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
});
