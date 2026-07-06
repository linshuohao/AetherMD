## Why

`docs/architecture/principles.md` 将 **Instant Morphing**、**Block Focus** 与零延迟输入定义为架构审判标准，并引用《产品交互体验设计规范》——但该规范在仓库中**不存在**。M1–M6 与 Demo Slice 程序按「架构验证 + 可连续打字的 PM 富文本壳」交付，与产品 north star（块级渲染态 ↔ Markdown 源码态切换）**未建立可追溯的规格与验收链路**。若不先冻结产品交互模型并修正 north star 叙事，后续实现会继续滑向传统 ProseMirror 富文本编辑器，而非 Block Morphing Markdown 编辑器。

## What Changes

- 新增权威文档 `docs/architecture/product-experience-spec.md`（产品交互体验设计规范）：定义 Instant Morphing、Block Focus、零延迟输入的可验收场景与术语。
- 新增 OpenSpec capability `product-experience`，作为后续实现切片的规格锚点。
- **澄清** M5 `@aether-md/react` + 常驻 ProseMirror 视图为 **Phase 0 集成壳（interim shell）**，**不是**产品终态交互模型。
- **修正** north star 分层：`react-basic` 继续作为 **架构 / 管线验证 demo**；产品 north star 改为 **Block Morphing 纵向切片**（独立 follow-up change）。
- 更新 `docs/glossary.md`、`docs/project-status.md`、`docs/architecture/roadmap.md`、`docs/README.md` 的交叉引用与阶段叙事。
- **不**在本 change 内实现 morphing 运行时（无 `packages/**` 行为变更）。

## Capabilities

### New Capabilities

- `product-experience`: Instant Morphing、Block Focus、块双态（rendered / source）、聚焦/失焦形态转换、与插件化块渲染器的契约对齐；north star 验收场景。

### Modified Capabilities

- `react-shell`: 标明 M5 Shell 为 Phase 0 interim；产品终态交互 **MUST** 由 `product-experience` 驱动，而非常驻 PM 富文本区 + 分离 preview。
- `validation-suite`: 区分 **架构 demo 验收**（`react-basic` 管线）与 **产品 north star 验收**（morphing slice，后续 change）；避免将前者冒充后者。

## Impact

- **代码**：本 change **无** `packages/**` 运行时变更。
- **文档**：`docs/architecture/product-experience-spec.md`（新）、`docs/glossary.md`、`docs/project-status.md`、`docs/architecture/roadmap.md`、`docs/README.md`、`docs/architecture/principles.md`（链接修正）。
- **OpenSpec**：新增 `product-experience` delta；MODIFIED `react-shell`、`validation-suite` delta。
- **版本**：五包 semver / `manifestVersion` **不变**；无 npm publish 影响。
- **后续**：实现切片 `block-morphing-slice-1`（或等价名）依赖本 change archive 后的 main spec sync。

## 非目标

- 实现 Block Morphing UI、块渲染插件运行时、`interactiveRenderers` 加载器。
- History / Selection / Clipboard 底座。
- 废弃或移除 M5 ProseMirror view-bridge（Phase 0 壳保留至 morphing 切片可替代）。
- M7 publish、workflow 主规范全面重写。

## Source Docs

- `docs/architecture/principles.md`
- `docs/architecture/roadmap.md`
- `docs/architecture/design-doc-map.md`
- `docs/sdk/manifest.md`（`interactiveRenderers`）
- `docs/sdk/custom-block-renderer.md`
- `docs/engineering/data-flow.md`
- `docs/engineering/demo-slice-delivery-program.md`
- `docs/engineering/mvp-implementation-plan.md`
- `essays/product-delivery/01-mvp-intent-vs-architecture-proof.md`
- `openspec/specs/react-shell/spec.md`
- `openspec/specs/validation-suite/spec.md`

## Branch

- `docs/align-instant-morphing-north-star`

## Acceptance Criteria

- [ ] `docs/architecture/product-experience-spec.md` 存在且含 Instant Morphing / Block Focus 可测场景
- [ ] `principles.md` 引用指向真实文档路径
- [ ] OpenSpec `align-instant-morphing-north-star` validate --strict 通过
- [ ] `project-status.md` 明确区分架构 demo 与产品 north star
- [ ] 维护者可从 README 找到产品体验规范入口
