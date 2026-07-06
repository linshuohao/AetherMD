export interface AetherDoc {
  type: "doc";
  children: AetherBlock[];
  meta?: Record<string, unknown>;
}

export type AetherBlock = ParagraphBlock | HeadingBlock | ListBlock | CustomBlock;

export type AetherInline = TextInline | LinkInline | MarkedInline;

export interface ParagraphBlock {
  type: "paragraph";
  children: AetherInline[];
}

export interface HeadingBlock {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: AetherInline[];
}

export interface ListBlock {
  type: "list";
  ordered: boolean;
  items: AetherBlock[][];
}

export interface CustomBlock {
  type: "custom";
  name: string;
  attrs?: Record<string, unknown>;
  children?: AetherBlock[] | AetherInline[];
}

export interface TextInline {
  type: "text";
  text: string;
}

export interface LinkInline {
  type: "link";
  href: string;
  title?: string;
  children: AetherInline[];
}

export interface MarkedInline {
  type: "mark";
  mark: "strong" | "emphasis" | string;
  children: AetherInline[];
}

export interface AetherSchema {
  version: 1;
}
