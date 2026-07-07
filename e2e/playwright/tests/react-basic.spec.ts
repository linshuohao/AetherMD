import { expect, test } from "@playwright/test";

import {
  expectReactBasicEditorStable,
  expectReactBasicMarkdownContains,
  forceReactBasicRerender,
  gotoReactBasicDemo,
} from "../fixtures/react-basic";

test.describe("react-basic demo e2e (AetherEditorContent shell)", () => {
  test("smoke: ProseMirror shell mounts with showcase markdown", async ({ page }) => {
    await gotoReactBasicDemo(page);

    await expect(page.getByTestId("aether-shell-showcase")).toBeVisible();
    await expect(page.locator(".ProseMirror")).toBeVisible();
    await expectReactBasicMarkdownContains(page, "**world**");
    await expectReactBasicEditorStable(page);
  });

  test("GateLock: parent rerender preserves serialized markdown", async ({ page }) => {
    await gotoReactBasicDemo(page);

    const before = await page.getByTestId("e2e-probes").getAttribute("data-markdown");

    await forceReactBasicRerender(page);

    await expect(page.getByTestId("e2e-probes")).toHaveAttribute("data-markdown", before ?? "");
    await expectReactBasicEditorStable(page);
  });

  test("typing: ProseMirror accepts keyboard input and syncs markdown", async ({ page }) => {
    await gotoReactBasicDemo(page);

    const editor = page.locator(".ProseMirror");
    await editor.click();
    await page.keyboard.press("End");
    await page.keyboard.type(" — typed in browser");

    await expectReactBasicMarkdownContains(page, "typed in browser");
    await expectReactBasicEditorStable(page);
  });
});
