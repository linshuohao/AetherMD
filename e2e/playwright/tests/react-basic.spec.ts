import { expect, test } from "@playwright/test";

import {
  expectReactBasicEditorStable,
  forceReactBasicRerender,
  gotoReactBasicDemo,
} from "../fixtures/react-basic";

test.describe("react-basic demo e2e (L1)", () => {
  test("smoke: Phase 0 shell mounts ProseMirror and markdown preview", async ({ page }) => {
    await gotoReactBasicDemo(page);

    await expect(page.getByRole("heading", { name: "AetherMD React Basic Example" })).toBeVisible();
    await expect(page.locator(".ProseMirror")).toBeVisible();
    await expect(page.getByTestId("markdown-preview")).toContainText("**bold**");
    await expectReactBasicEditorStable(page);
  });

  test("GateLock: parent rerender preserves preview markdown", async ({ page }) => {
    await gotoReactBasicDemo(page);

    const preview = page.getByTestId("markdown-preview");
    const before = await preview.textContent();

    await forceReactBasicRerender(page);

    await expect(preview).toHaveText(before ?? "");
    await expectReactBasicEditorStable(page);
  });

  test("typing: ProseMirror accepts keyboard input and syncs preview", async ({ page }) => {
    await gotoReactBasicDemo(page);

    const editor = page.locator(".ProseMirror");
    await editor.click();
    await page.keyboard.press("End");
    await page.keyboard.type(" — typed in browser");

    await expect(page.getByTestId("markdown-preview")).toContainText("typed in browser");
    await expectReactBasicEditorStable(page);
  });
});
