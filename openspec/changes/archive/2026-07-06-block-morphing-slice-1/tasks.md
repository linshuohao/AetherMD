## 1. OpenSpec 与脚手架

- [ ] 1.1 确认 `openspec/changes/block-morphing-slice-1/` artifacts 与 `openspec validate block-morphing-slice-1 --strict` 通过
- [ ] 1.2 创建 `examples/block-morphing` workspace package 并纳入 `pnpm check`

## 2. React Shell morphing 模块

- [ ] 2.1 实现 `renderParagraphInline` 与 `AetherMorphingContent`（focus 状态机、textarea/div surfaces）
- [ ] 2.2 编辑经 `core:replaceText` dispatch；export 自 `@aether-md/react`

## 3. 集成测试

- [ ] 3.1 happy-dom 场景 A：聚焦见 `**` 源码
- [ ] 3.2 happy-dom 场景 B：失焦见渲染、序列化一致
- [ ] 3.3 零 remount：连续编辑与父 rerender 后 editor 实例不变

## 4. Example 与文档

- [ ] 4.1 `examples/block-morphing` App + README + 样式
- [ ] 4.2 更新 `docs/project-status.md` L2 行

## 5. 验证与归档

- [ ] 5.1 `pnpm check` 全绿
- [ ] 5.2 compliance review + archive + main spec sync
