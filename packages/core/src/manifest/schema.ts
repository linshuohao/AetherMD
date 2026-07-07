export interface SchemaDeclaration {
  type: "node" | "mark";
  name: string;
  matchMarkdownTag?: string;
}

export function normalizeSchemaDeclarations(
  input: SchemaDeclaration | SchemaDeclaration[] | undefined,
): SchemaDeclaration[] {
  if (input === undefined) {
    return [];
  }
  if (Array.isArray(input)) {
    return [...input];
  }
  return [input];
}

export function schemaDeclarationKey(decl: SchemaDeclaration): string {
  return `${decl.type}:${decl.name}`;
}

export function areSchemaDeclarationsEqual(
  left: SchemaDeclaration,
  right: SchemaDeclaration,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
