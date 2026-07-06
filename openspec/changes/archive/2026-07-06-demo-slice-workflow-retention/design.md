## Context

[Demo Slice 交付计划](../../docs/engineering/demo-slice-delivery-program.md) PR0→PR A 已验证：前置 Spec Change + 单 task 实现 + main spec sync 足够交付 north star demo，无需 Full Change。

## Goals

1. **Path 降档（有证据）** — `examples/**` demo slice、无 public export 变更 → 默认 Spec Change；Quick Change 仅限 example-only 文档/样式。
2. **Retention** — archive 后活跃 `.superpowers/` 只留进行中 change；已完成 change 的 task/plan/review 移入 `.superpowers/archive/<date>-<change>/`，保留 final-report + validation。
3. **闭合程序** — 归档 PR0/PR A；交付计划标记完成；M7 触发条件写入 project-status。

## Non-Goals

见 proposal。

## Design

### Discover 门槛调整

| 变更类型                                                        | 默认路径         |
| --------------------------------------------------------------- | ---------------- |
| `examples/**` demo slice，无 public export / main spec 语义变更 | **Spec Change**  |
| example README、样式、初始 markdown                             | **Quick Change** |
| 新 package、public SDK/Core API、workflow semantics             | **Full Change**  |
| 多 capability / 多 task 且无法单 task 完成                      | **Full Change**  |

Protected boundaries 将原「MVP package or runtime behavior first implementation」细化为 **「MVP public contract 或新 publishable package 首次实现」**。

### Superpowers retention

```text
.superpowers/
  archive/
    YYYY-MM-DD-<change>/
      final-report.md
      validation.md
      tasks/          # optional copy
      review.md       # optional
  tasks/              # active changes only
  plans/              # active changes only
  reviews/            # active changes only
  runs/               # active + recent final-report until compressed
```

Archive skill Step 11+：OpenSpec archive 成功后，将对应 Superpowers 执行细节移入 `archive/`。

## Risks

- 过度降档导致 under-process → escalation triggers 保留；public contract 仍强制 Full。
- 过早删除 task 文件 → git history + archive 目录保留 final-report 摘要。

## Test Strategy

- `pnpm skills:check`
- `pnpm check`
- `rg` 验证 discover / archive 措辞
