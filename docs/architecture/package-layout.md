# 规范目录结构

> 状态：M1 Core Bootstrap 已开始。本页作为包布局主题的维护入口。

## 规范目录结构

```text
aether-md/
├── docs/
│   ├── architecture/                # 架构文档
│   ├── sdk/                         # Plugin SDK
│   └── engineering/                 # 工程文档
├── packages/
│   ├── core/
│   ├── preset-gfm/
│   ├── react/
│   ├── vue/
│   └── plugins/
│       ├── plugin-prosemirror/
│       ├── plugin-remark/
│       └── ...
```

当前实现状态：

- `packages/core` 已建立为 `@aether-md/core` 的 M1 Core Bootstrap package。
- 其他 v1.0 package 仍是规划项，尚未建立实现边界。

---
