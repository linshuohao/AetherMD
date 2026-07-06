import { expect, test } from "@playwright/test";

import { block, gotoMorphingDemo } from "../fixtures/editor";

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

    const listBlock = block(page, 1);
    await listBlock.getByTestId("morphing-rendered").focus();

    await expect(listBlock).toHaveAttribute("data-focused", "true");
    await expect(listBlock.getByTestId("morphing-source")).toBeVisible();
    await expect(block(page, 0).getByTestId("morphing-rendered")).toBeVisible();
    await expect(block(page, 2).getByTestId("morphing-rendered")).toBeVisible();
    await expect(page.getByTestId("morphing-source")).toHaveCount(1);
  });

  test("instant morphing: source edit and blur re-renders list", async ({ page }) => {
    await gotoMorphingDemo(page);

    const listBlock = block(page, 1);
    await listBlock.getByTestId("morphing-rendered").focus();

    const source = listBlock.getByTestId("morphing-source");
    await expect(source).toBeVisible();
    await source.fill("- one\n- two\n- three");
    await source.blur();

    await expect(listBlock.getByTestId("morphing-rendered")).toBeVisible();
    await expect(listBlock.locator("li")).toHaveCount(3);
    await expect(listBlock.locator("li").nth(0)).toHaveText("one");
    await expect(listBlock.locator("li").nth(1)).toHaveText("two");
    await expect(listBlock.locator("li").nth(2)).toHaveText("three");
  });

  test("regression: force parent rerender preserves edited content", async ({ page }) => {
    await gotoMorphingDemo(page);

    const listBlock = block(page, 1);
    await listBlock.getByTestId("morphing-rendered").focus();
    const source = listBlock.getByTestId("morphing-source");
    await source.fill("- edited alpha\n- edited beta");
    await source.blur();

    await expect(listBlock.locator("li").nth(0)).toHaveText("edited alpha");
    await page.getByRole("button", { name: /Force parent rerender/ }).click();
    await expect(listBlock.locator("li").nth(0)).toHaveText("edited alpha");
    await expect(listBlock.locator("li").nth(1)).toHaveText("edited beta");
  });
});
