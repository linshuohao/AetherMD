## Decisions

### D1: O1 首次版本号 → `0.1.0`

v1.0 差距项（History、PermissionGuard 等）仍多；采用 0.x 预稳定系列，文档声明能力子集。

### D2: O2 Canary dist-tag → `canary`

与 ADR 009 默认措辞一致；`changeset pre enter canary` 由维护者在启用 `NPM_TOKEN` 前执行一次。

### D3: Consumer smoke 实现

`scripts/consumer-smoke.mjs`：

1. `pnpm build`
2. 五包 `pnpm pack` 至临时目录
3. 空 consumer `package.json`（`type: module`）以 `file:` 引用 tarball；`react` 为 peer 满足 `@aether-md/react` import
4. `node smoke.mjs` 断言各包主入口 export 可 import

纳入根 `pnpm check` 前的 `consumer:smoke` 脚本；CI quality job 增加一步。

### D4: Release CI

`.github/workflows/release.yml` 使用 `changesets/action@v1`：

- trigger: `push` to `main`
- `version: pnpm changeset version`
- `publish: pnpm changeset:publish`
- secrets: `GITHUB_TOKEN`, `NPM_TOKEN`
- publish 前须 `changeset pre enter canary`（文档化；不提交 `pre.json` 直至维护者启用）

### D5: Sign-off 记录

`docs/project-status.md` 记录：

- L1/L2 自动化验证状态（CI + E2E）
- 维护者浏览器 sign-off checklist（诚实标注 pending）

## Boundary Checks

- 不修改 Core/React 生产 runtime
- 不升 E2E 为阻塞门禁
- CI-only publish；禁止本地 `npm publish`

## Test Strategy

- `pnpm consumer:smoke`
- `pnpm check`
- 各包 `pnpm pack` smoke
