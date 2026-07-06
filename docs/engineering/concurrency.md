# 并发策略

> 状态：设计草案。实现开始前，本页作为对应主题的维护入口。

## 并发策略

### Command Queue

```
并发命令 → Command Queue (FIFO + 优先级) → 逐个执行 Command Pipeline
```

### 优先级（RECOMMENDED）

| 优先级 | 类型               | 示例                           |
| ------ | ------------------ | ------------------------------ |
| P0     | 系统 / 撤销        | `undo`, `redo`                 |
| P1     | 用户直接输入       | `insertText`, `deleteBackward` |
| P2     | 快捷键 / InputRule | `toggleBold`                   |
| P3     | 插件 / Shell 异步  | `insertImage`, AI 补全         |

### 原子性与可取消性

| 属性                   | 策略                                                    |
| ---------------------- | ------------------------------------------------------- |
| **Atomic Transaction** | 单次 Pipeline **MUST** 原子提交；失败 **MUST** 完整回滚 |
| **Coalescing**         | 同帧连续 `insertText` **SHOULD** 合并                   |
| **Cancelable**         | 队列中 P2/P3 **MAY** 被同类型新命令替换                 |
| **不可取消**           | P0 / P1 **MUST NOT** 被取消                             |

**典型场景：**

```
insertImage() + toggleBold() + undo() 同时到达
  → undo() 进 P0 队列头
  → insertText 类进 P1
  → toggleBold 进 P2
  → 顺序执行，各自原子提交
```

---
