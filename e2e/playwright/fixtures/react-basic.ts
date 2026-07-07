import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

const REACT_BASIC_PORT = 4174;
const REACT_BASIC_URL = `http://127.0.0.1:${REACT_BASIC_PORT}`;

export async function gotoReactBasicDemo(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.getByTestId("e2e-probes")).toHaveAttribute("data-ready", "true");
  await expect(page.getByTestId("aether-react-basic-shell")).toBeVisible();
  await expect(page.locator(".ProseMirror")).toBeVisible();
}

export async function expectReactBasicEditorStable(page: Page): Promise<void> {
  await expect(page.getByTestId("e2e-probes")).toHaveAttribute("data-editor-stable", "true");
}

export async function expectReactBasicMarkdownContains(
  page: Page,
  substring: string,
): Promise<void> {
  await expect
    .poll(async () => page.getByTestId("e2e-probes").getAttribute("data-markdown"))
    .toContain(substring);
}

export async function forceReactBasicRerender(page: Page): Promise<void> {
  await page.getByTestId("force-parent-rerender").click();
}

export { REACT_BASIC_PORT, REACT_BASIC_URL };
