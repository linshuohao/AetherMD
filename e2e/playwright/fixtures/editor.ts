import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export async function gotoMorphingDemo(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.getByTestId("aether-morphing-document")).toHaveAttribute("data-ready", "true");
}

export function block(page: Page, index: number) {
  return page.getByTestId(`morphing-block-${index}`);
}
