import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export {
  block,
  blockById,
  blurBlock,
  editSource,
  expectEditorStable,
  expectListItems,
  expectMarkdownContains,
  expectSingleSource,
  expectStableBlockIds,
  focusBlock,
  focusBlockWithTab,
  forceParentRerender,
  moveListBlockDown,
  rendered,
  source,
  typeInSource,
  waitForBlockSynced,
  waitForRendered,
} from "./editor";

export async function gotoVueMorphingDemo(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByTestId("shell-mode-morphing").click();
  await expect(page.getByTestId("aether-morphing-document")).toHaveAttribute("data-ready", "true");
  await expect(page.getByTestId("morphing-block-0")).toBeVisible();
  await expect(page.getByTestId("morphing-block-1")).toBeVisible();
  await expect(page.getByTestId("morphing-block-2")).toBeVisible();
  await expect(page.getByTestId("e2e-probes")).toHaveAttribute("data-ready", "true");
}
