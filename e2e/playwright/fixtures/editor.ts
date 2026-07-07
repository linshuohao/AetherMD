import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export type FocusVia = "focus" | "click";

export async function gotoMorphingDemo(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByTestId("shell-mode-morphing").click();
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

export function markdownProbe(page: Page): Locator {
  return page.getByTestId("e2e-probes");
}

export async function expectMarkdownContains(page: Page, substring: string): Promise<void> {
  await expect
    .poll(async () => markdownProbe(page).getAttribute("data-markdown"))
    .toContain(substring);
}

export async function expectEditorStable(page: Page): Promise<void> {
  await expect(markdownProbe(page)).toHaveAttribute("data-editor-stable", "true");
}

export async function expectStableBlockIds(page: Page, count = 3): Promise<void> {
  const blocks = page.locator("[data-block-id]");
  await expect(blocks).toHaveCount(count);
  const ids = await blocks.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-block-id")),
  );
  expect(new Set(ids).size).toBe(count);
  for (const id of ids) {
    expect(id).toMatch(/^blk_/);
  }
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

export async function focusBlockWithTab(page: Page, blockIndex: number): Promise<void> {
  // Tab order: shell switcher (2) → morphing rendered surfaces → e2e toolbar.
  await page.getByTestId("shell-mode-content").focus();
  const tabsToBlock = 2 + blockIndex;
  for (let step = 0; step < tabsToBlock; step += 1) {
    await page.keyboard.press("Tab");
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

export async function typeInSource(
  page: Page,
  blockIndex: number,
  text: string,
  options?: { blur?: boolean; delay?: number },
): Promise<void> {
  await focusBlock(page, blockIndex);
  const textarea = source(page, blockIndex);
  await textarea.fill("");
  await textarea.pressSequentially(text, { delay: options?.delay ?? 15 });
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
  await page.getByTestId("force-parent-rerender").click({ force: true });
}

export async function moveListBlockDown(page: Page): Promise<string> {
  const listBlockId = await block(page, 1).getAttribute("data-block-id");
  if (!listBlockId) {
    throw new Error("expected list block data-block-id");
  }
  await page.evaluate(
    async ({ blockId }) => {
      if (!window.__AETHER_E2E__) {
        throw new Error("missing window.__AETHER_E2E__");
      }
      await window.__AETHER_E2E__.moveBlock(blockId, 2);
    },
    { blockId: listBlockId },
  );
  await expect(block(page, 2)).toHaveAttribute("data-block-id", listBlockId);
  return listBlockId;
}

export async function blockById(page: Page, blockId: string): Promise<Locator> {
  return page.locator(`[data-block-id="${blockId}"]`);
}
