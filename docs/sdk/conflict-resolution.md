# 冲突解决策略


## 冲突解决策略

### 策略枚举

```typescript
export type ConflictStrategy =
  | "first-wins" // 先注册者优先
  | "last-wins" // 后注册者优先（覆盖）
  | "abort" // 启动失败
  | "ignore" // 静默丢弃后者
  | "merge"; // 尝试合并（仅 inputRules / pasteRules）
```

### ConflictResolver 接口

宿主 **MAY** 注入自定义 `ConflictResolver`，完全覆盖默认策略：

```typescript
export interface ConflictContext {
  type: "command" | "keymap" | "schema" | "capability";
  existing: { pluginName: PluginName; value: unknown };
  incoming: { pluginName: PluginName; value: unknown };
}

export interface ConflictResolution {
  strategy: ConflictStrategy;
  /** 最终生效的值；strategy === 'abort' 时忽略 */
  winner?: unknown;
  /** 是否向开发者输出警告 */
  warn?: boolean;
}

export interface ConflictResolver {
  resolve(ctx: ConflictContext): ConflictResolution;
}

/** Core 默认实现 */
export function createDefaultConflictResolver(
  overrides?: Partial<Record<ConflictContext["type"], ConflictStrategy>>,
): ConflictResolver;
```

### 默认策略表

| 冲突类型                           | 默认 strategy       | 可覆盖                     |
| ---------------------------------- | ------------------- | -------------------------- |
| Command 同名                       | `last-wins`         | ✓                          |
| Keymap 快捷键                      | `first-wins`        | ✓                          |
| Schema 节点/标记同名               | `abort`             | ✗（**MUST NOT** 静默覆盖） |
| Service Capability `provides` 重复 | `first-wins` + warn | ✓                          |

**EditorConfig 注入示例：**

```typescript
createEditor({
  plugins: [BoldPlugin(), CustomBoldPlugin()],
  conflictResolver: createDefaultConflictResolver({
    command: "first-wins", // 覆盖默认 last-wins
    keymap: "abort", // 快捷键冲突直接启动失败
  }),
});
```

---
