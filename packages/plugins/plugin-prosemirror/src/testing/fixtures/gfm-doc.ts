import { type AetherDoc } from "@aether-md/core/document";

export function gfmFixtureDoc(): AetherDoc {
  return {
    type: "doc",
    children: [
      {
        type: "paragraph",
        children: [
          {
            type: "mark",
            mark: "strong",
            children: [{ type: "text", text: "bold" }],
          },
        ],
      },
      {
        type: "paragraph",
        children: [
          {
            type: "mark",
            mark: "emphasis",
            children: [{ type: "text", text: "italic" }],
          },
        ],
      },
      {
        type: "list",
        ordered: false,
        items: [
          [
            {
              type: "paragraph",
              children: [{ type: "text", text: "item" }],
            },
          ],
        ],
      },
      {
        type: "paragraph",
        children: [
          {
            type: "link",
            href: "https://example.com",
            children: [{ type: "text", text: "label" }],
          },
        ],
      },
    ],
  };
}
