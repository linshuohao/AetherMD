# Task 05: G11 `SUPPORTED_MANIFEST_VERSIONS` 与 SDK 文档一致性校验

Change:

- `add-validation-suite`

Branch:

- `feat/add-validation-suite`

Spec Requirement:

- `validation-suite` / ADDED `Supported manifest versions stay consistent with SDK documentation`（Scenario: Manifest version constant matches SDK docs；Scenario: Official packages use supported manifest versions）
- `engineering-workflow` / ADDED `M6 validation gates participate in root check pipeline`（manifest gate 经 core test 纳入 check）

OpenSpec Tasks:

- `openspec/changes/add-validation-suite/tasks.md` §4.1、§4.2

Source Docs:

- `.superpowers/plans/add-validation-suite.md`
- `openspec/changes/add-validation-suite/specs/validation-suite/spec.md`
- `openspec/changes/add-validation-suite/specs/engineering-workflow/spec.md`
- `docs/sdk/manifest.md`（G11 校验对象）
- `docs/architecture/ci-checklist.md`

## 目标

实现 `packages/core/src/manifest-doc-consistency.test.ts`（或等价名）：断言 `SUPPORTED_MANIFEST_VERSIONS`（code truth = `manifest.ts`）与 `docs/sdk/manifest.md` Stable 版本表一致；扫描官方包 `manifestVersion` ∈ `SUPPORTED_MANIFEST_VERSIONS`。故意 drift 应 FAIL。

## 范围

- 新增 G11 测试文件，挂入现有 `packages/core` test pipeline。
- code truth = `packages/core/src/manifest.ts` 的 `SUPPORTED_MANIFEST_VERSIONS`；**不**维护第二份手写常量。
- 解析 `docs/sdk/manifest.md` Stable 表格行（如 `| \`1\` | **Stable** |`）。
- 扫描官方 plugin/preset/react 包 `manifestVersion`。
- **不**修改 `manifest.ts`（除非 docs/code 真 drift 需对齐，须记录 Deviation）。

Depends On:

- none

Parallel Group:

- wave-c

Barrier:

- false

Allowed Files:

- `packages/core/src/manifest-doc-consistency.test.ts`（或等价名）
- `packages/core/tsconfig.test.json`（若需 include）
- `packages/core/package.json`（test script 若需）
- `docs/sdk/manifest.md`（仅真 drift 对齐修复）

Forbidden Files:

- `packages/core/src/manifest.ts`（除非 docs/code 真 drift）
- `packages/core/src/**` 生产语义变更
- `SUPPORTED_MANIFEST_VERSIONS` 值变更（仍为 `[1]`）
- `examples/react-basic/**`
- `npm publish`、`NPM_TOKEN`、`.github/workflows/**` release job
- 无关 package 运行时语义变更

Implementation Notes:

- G11 失败 **MUST** 使 `pnpm check` 失败（经 core test suite）。
- 避免手写双份版本列表；从 `manifest.ts` 导出为 truth。

TDD Notes:

- **Red：** 先写 failing test：解析 `docs/sdk/manifest.md` Stable 行与 `SUPPORTED_MANIFEST_VERSIONS` 比较；故意改 docs 表格应 FAIL。
- **Red：** 扫描官方包 `manifestVersion` 测试；unsupported version 应 FAIL。
- **Green：** 实现解析与断言后 test PASS。
- **Refactor：** 提取 `parseStableManifestVersions` 等 helper（若需），保持单文件职责清晰。

Validation:

```bash
pnpm --filter @aether-md/core test -- --test-name-pattern="manifest"
```

或完整 core test suite：

```bash
pnpm --filter @aether-md/core test
```

预期：G11 tests **PASS**；故意 drift docs 应 **FAIL**（验证后恢复）。

Intuitive Verification:

- 阅读 `manifest-doc-consistency.test.ts`：确认 code truth 来自 `manifest.ts` import，非硬编码 `[1]` 副本。
- 运行 core test 输出：manifest consistency describe 全绿。

Review Checklist:

- [ ] code truth = `SUPPORTED_MANIFEST_VERSIONS` from `manifest.ts`。
- [ ] 解析 `docs/sdk/manifest.md`，非维护第二份常量文件。
- [ ] 官方五包 `manifestVersion` 扫描覆盖。
- [ ] 未改 `SUPPORTED_MANIFEST_VERSIONS` 值（仍为 `[1]`）。
- [ ] 未改 Core 生产 runtime 语义。

Rollback Notes:

- 删除 `manifest-doc-consistency.test.ts` 及 test pipeline 挂接变更。

Version Impact:

- none（测试 + 可选 docs 对齐）；`SUPPORTED_MANIFEST_VERSIONS` / `manifestVersion` **不变**（`[1]`）。

Commit Scope:

- `test(core): enforce manifest version doc consistency`

Status:

- done

Run Log:

- Added `packages/core/src/manifest-doc-consistency.test.ts` with `parseStableManifestVersions` (parses `| \`N\` | **Stable** |`rows from`docs/sdk/manifest.md`) and `collectOfficialManifestVersions`(scans`plugin-remark`, `plugin-prosemirror`, `preset-gfm`, `react` `src/`for`manifestVersion:` literals).
- Code truth imported from `./manifest.js` (`SUPPORTED_MANIFEST_VERSIONS`); no duplicate version constant.
- Fixed `packages/core/package.json` test script glob (`dist-test/**/*.test.js` only ran editor subfolder tests); now uses `find dist-test -name '*.test.js'` so G11 tests participate in `pnpm check`.
- Validation: `pnpm --filter @aether-md/core test -- --test-name-pattern="manifest"` — 85 tests pass (includes `manifest documentation consistency` ×2 and `loadPluginManifests` ×4).

Deviation:

- Updated `packages/core/package.json` test script (allowed file) so top-level `dist-test/*.test.js` files—including the new G11 test—run in the core test pipeline; pre-existing glob omitted them.
