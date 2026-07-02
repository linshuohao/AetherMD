# ConflictResolver 默认实现参考

> 状态：设计草案。实现开始前，本页作为对应主题的维护入口。

## ConflictResolver 默认实现参考

```typescript
const DEFAULT_STRATEGIES: Record<ConflictContext['type'], ConflictStrategy> = {
  command: 'last-wins',
  keymap: 'first-wins',
  schema: 'abort',
  capability: 'first-wins',
};

export function createDefaultConflictResolver(
  overrides?: Partial<typeof DEFAULT_STRATEGIES>
): ConflictResolver {
  const strategies = { ...DEFAULT_STRATEGIES, ...overrides };

  return {
    resolve(ctx) {
      const strategy = strategies[ctx.type];
      if (strategy === 'abort') {
        return {
          strategy,
          warn: true,
        };
      }
      const winner = strategy === 'first-wins' ? ctx.existing : ctx.incoming;
      return { strategy, winner: winner.value, warn: true };
    },
  };
}
```

---
