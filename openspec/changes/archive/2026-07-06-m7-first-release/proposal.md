## Why

M6 验证套件与 L2 Slice A–D 已闭合；Playwright E2E Phase 1 已接入。按 [ADR 009](docs/adr/009-release-governance.md) 与 [MVP 实施计划](docs/engineering/mvp-implementation-plan.md)，项目须进入 **M7 首次 npm canary 发布**：闭合 G2/G8/G9/G10、决议 O1/O2，使五包可从 npm 安装。

## What Changes

- **O1/O2 决议**：首次版本 `0.1.0`（0.x 预稳定）；canary dist-tag `canary`
- **去 `private: true`**：五包 linked 组可 publish
- **`scripts/consumer-smoke.mjs`**：G8 `pnpm pack` 后空项目 import 主入口
- **Release CI**：`.github/workflows/release.yml`（Changesets action；`NPM_TOKEN`）
- **文档**：README 安装说明、`release-process.md`、`project-status.md`、M7 sign-off 记录
- **Changeset**：首次发布版本 bump
- Delta spec：`validation-suite` ADDED consumer smoke + release CI requirements

## Capabilities

### New Capabilities

- （无新 capability）

### Modified Capabilities

- `validation-suite`: ADDED consumer smoke、Release CI、M7 publish 预备完成态

## Impact

- **包元数据**：五包移除 `private: true`；semver → `0.1.0`（via Changesets）
- **CI**：`consumer:smoke` 纳入 quality gates；新增 `release.yml`
- **无** public API breaking change
- **不执行**实际 npm publish（需 `NPM_TOKEN` secret 配置后由 CI 触发）

## 非目标

- History / Selection / Clipboard
- Playwright 升阻塞门禁
- Vue Shell、examples matrix
- 实际 promote 至 `latest`

## Source Docs

- `docs/adr/009-release-governance.md`
- `.superpowers/plans/m7-release-prep.md`
- `docs/community/release-process.md`

## Version Impact

- 五包 linked：**minor** `0.0.0` → `0.1.0`（首次公开发布，0.x 预稳定）
- `manifestVersion` 不变

## 验收标准

- `pnpm consumer:smoke` 绿
- 五包 `private` 已移除；`pnpm pack` 可产出 tarball
- `release.yml` 存在且文档化 `NPM_TOKEN` 配置步骤
- O1/O2 已写入 `release-process.md`
- `pnpm check` 绿
