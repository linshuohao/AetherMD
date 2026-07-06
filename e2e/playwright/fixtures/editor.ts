import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export type FocusVia = "focus" | "click";

export async function gotoMorphingDemo(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.getByTestId("aether-morphing-document")).toHaveAttribute("data-ready", "true");
  await expect(page.getByTestId("morphing-block-0")).toBeVisible();
  await expect(page.getByTestId("morphing-block-1")).toBeVisible();
  await expect(page.getByTestId("morphing-block-2")).toBeVisible();
}

export function block(page: Page, index: number): Locator {
  return page.getByTestId(`morphing-block-${index}`);
}

export function rendered(page: Page, blockIndex: number): Locator {
  return block(page, blockIndex).getByTestId("morphing-rendered");
}

export function source(page: Page, blockIndex: number): Locator {
  return block(page, blockIndex).getByTestId("morphing-source");
}

export async function focusBlock(
  page: Page,
  blockIndex: number,
  options?: { via?: FocusVia },
): Promise<void> {
  const surface = rendered(page, blockIndex);
  if (options?.via === "click") {
    await surface.click();
  } else {
    await surface.focus();
  }
  await expect(block(page, blockIndex)).toHaveAttribute("data-focused", "true");
  await expect(source(page, blockIndex)).toBeVisible();
  await expectSingleSource(page);
}

export async function waitForBlockSynced(page: Page, blockIndex: number): Promise<void> {
  await expect(block(page, blockIndex)).toHaveAttribute("data-edit-synced", "true");
}

export async function blurBlock(page: Page, blockIndex: number): Promise<void> {
  await source(page, blockIndex).blur();
  await waitForRendered(page, blockIndex);
}

export async function waitForRendered(page: Page, blockIndex: number): Promise<void> {
  const target = block(page, blockIndex);
  await expect(target.getByTestId("morphing-rendered")).toBeVisible();
  await expect(target.getByTestId("morphing-source")).toHaveCount(0);
}

export async function expectSingleSource(page: Page): Promise<void> {
  await expect(page.getByTestId("morphing-source")).toHaveCount(1);
}

export async function editSource(
  page: Page,
  blockIndex: number,
  markdown: string,
  options?: { blur?: boolean },
): Promise<void> {
  await focusBlock(page, blockIndex);
  const textarea = source(page, blockIndex);
  await textarea.fill(markdown);
  await expect(textarea).toHaveValue(markdown);
  await waitForBlockSynced(page, blockIndex);
  if (options?.blur !== false) {
    await blurBlock(page, blockIndex);
  }
}

export async function expectListItems(
  page: Page,
  blockIndex: number,
  items: string[],
): Promise<void> {
  const list = block(page, blockIndex).locator("li");
  await expect(list).toHaveCount(items.length);
  for (const [index, text] of items.entries()) {
    await expect(list.nth(index)).toHaveText(text);
  }
}

export async function forceParentRerender(page: Page): Promise<void> {
  await page.getByRole("button", { name: /Force parent rerender/ }).click();
}
