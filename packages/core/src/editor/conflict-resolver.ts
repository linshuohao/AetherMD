export type ConflictStrategy = "last-wins" | "first-wins" | "abort";

export interface ConflictContext {
  type: "command" | "keymap" | "schema" | "capability";
  existing: { value: unknown };
  incoming: { value: unknown };
}

export interface ConflictResolution {
  strategy: ConflictStrategy;
  winner?: unknown;
  warn?: boolean;
}

export interface ConflictResolver {
  resolve(ctx: ConflictContext): ConflictResolution;
}

const DEFAULT_STRATEGIES: Record<ConflictContext["type"], ConflictStrategy> = {
  command: "last-wins",
  keymap: "first-wins",
  schema: "abort",
  capability: "first-wins",
};

export function createDefaultConflictResolver(
  overrides?: Partial<typeof DEFAULT_STRATEGIES>,
): ConflictResolver {
  const strategies = { ...DEFAULT_STRATEGIES, ...overrides };

  return {
    resolve(ctx) {
      const strategy = strategies[ctx.type];
      if (strategy === "abort") {
        return {
          strategy,
          warn: true,
        };
      }
      const winner =
        strategy === "first-wins" ? ctx.existing.value : ctx.incoming.value;
      return { strategy, winner, warn: true };
    },
  };
}
