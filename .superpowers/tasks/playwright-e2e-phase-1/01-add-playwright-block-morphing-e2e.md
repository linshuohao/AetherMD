# Task 01: add Playwright block-morphing E2E Phase 1

Change:

- `playwright-e2e-phase-1`

Branch:

- `feat/playwright-e2e-phase-1`

Spec Requirement:

- `validation-suite` / ADDED `Playwright browser E2E Phase 1 covers block-morphing demo`
- `openspec/changes/playwright-e2e-phase-1/change-brief.md`

Source Docs:

- `openspec/changes/playwright-e2e-phase-1/change-brief.md`
- `openspec/changes/playwright-e2e-phase-1/specs/validation-suite/spec.md`
- `.superpowers/plans/m7-release-prep.md`（Task 01–04）
- `docs/engineering/test-strategy.md`
- `docs/architecture/product-experience-spec.md`

## 目标

落地 `e2e/playwright/` 四轮用例、根 scripts、CI 非阻塞 job 与文档；`pnpm check` 与 `pnpm e2e:test` 绿。

## 范围

1. `e2e/playwright/playwright.config.ts` — webServer 拉起 `@aether-md/example-block-morphing` dev（port 4173）
2. `e2e/playwright/fixtures/editor.ts` — `gotoMorphingDemo`、`block()`
3. `e2e/playwright/tests/block-morphing.spec.ts` — 四轮场景
4. 根 `package.json` — `e2e:install`、`e2e:test`、devDependency `@playwright/test`
5. `.github/workflows/ci.yml` — `e2e-playwright` job，`continue-on-error: true`
6. `.gitignore` — playwright artifacts
7. 文档：`test-strategy.md`、`README.md`、`examples/block-morphing/README.md`

Depends On:

- none

Parallel Group:

- wave-a

Barrier:

- false

Allowed Files:

- `e2e/playwright/**`
- `package.json`
- `pnpm-lock.yaml`
- `.github/workflows/ci.yml`
- `.gitignore`
- `docs/engineering/test-strategy.md`
- `README.md`
- `examples/block-morphing/README.md`
- `openspec/changes/playwright-e2e-phase-1/**`
- `openspec/specs/validation-suite/spec.md`（main spec sync，execute 阶段）

Forbidden Files:

- `packages/**` 生产 runtime（除非 deviation）
- 五包 `private` 移除
- Release workflow、`NPM_TOKEN`
- workflow skill mirrors

Implementation Notes:

- E2E 仅覆盖浏览器专属行为；不断言 Vitest 已覆盖的 dispatch 路径。
- CI job **必须** `continue-on-error: true`。

TDD Notes:

- **Red：** 无 `e2e/` 时 `pnpm e2e:test` 失败。
- **Green：** 四轮 Playwright 通过；`pnpm check` 绿。

Validation:

```bash
pnpm format
pnpm check
pnpm e2e:install
pnpm e2e:test
```

Status:

- completed

Run Log:

- 2026-07-06: `pnpm format` — pass
- 2026-07-06: `pnpm check` — pass
- 2026-07-06: `pnpm e2e:install` — pass
- 2026-07-06: `pnpm e2e:test` — 4 passed (2.5s)

Deviation:

- none
