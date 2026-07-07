/**
 * Canonical editable article for all workspace examples.
 * Covers the GFM subset implemented today: headings, paragraphs, strong,
 * emphasis, links, unordered lists, and ordered lists.
 *
 * Blocks 0–2 are stable anchors for Playwright morphing e2e (paragraph, list, link).
 */
export const SHOWCASE_MARKDOWN = `Hello **world** with *emphasis*.

- alpha
- beta

Visit [docs](https://example.com) for more.

混排行内样式：**粗体**、*斜体*，以及 [行内链接](https://example.com)。

1. 第一项
2. 第二项

# AetherMD Markdown 语法展示

## 二级标题

三级标题与段落：

### 三级标题

支持在段落中组合 **粗体**、*斜体* 与 [链接](https://github.com/linshuohao/AetherMD)。
`;
